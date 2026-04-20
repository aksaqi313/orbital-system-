/* sprintf.js

   Copyright (C) 2011, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Monday 14 February 2011
   Last Change: Tuesday 30 July 2019
   Last Commit: $Date: 2019-07-30 13:11:43 -0600 (Tue, 30 Jul 2019) $
   Last Changed by: $Author: jon $

*/


function sprintf()
{
   var state_normal = 0;
   var state_flags = 1;
   var state_width = 2;
   var state_precision = 3;
   var state_conv = 4;   
   var format_spec = arguments[0].toString();
   var current_argument = 1;
   var pad_zero = false;
   var alternate = false;
   var add_sign = false;
   var left_justify = false;
   var width = 0;
   var precision = 6;
   var i = 0;
   var j = 0;
   var format_spec_len = format_spec.length;
   var state = state_normal;
   var rtn = String();
   var do_next_char = false;
   var ch;
   var scratch = String();
   var value;
   var locale_prototype = Number(1024.25).toLocaleString();
   var thousands_sep = locale_prototype.charAt(1);
   var decimal_point = locale_prototype.charAt(5);

   if(thousands_sep.localeCompare('.') !== 0 && thousands_sep.localeCompare(',') !== 0)
      thousands_sep = ',';
   if(decimal_point.localeCompare('.') !== 0 && decimal_point.localeCompare(',') !== 0)
      decimal_point = '.';
   while(i < format_spec_len)
   {
      ch = format_spec.charAt(i);
      do_next_char = true;
      if(state === state_normal)
      {
         if(ch === '%')
         {
            pad_zero = false;
            alternate = false;
            width = 0;
            precision = 6;
            add_sign = false;
            left_justify = false;
            state = state_flags;
         }
         else
            rtn += ch;
      }
      else if(state === state_flags)
      {
         switch(ch)
         {
         case '%':
            state = state_normal;
            rtn += '%';
            break;
            
         case '-':
            left_justify = true;
            break;
            
         case '+':
            add_sign = true;
            break;
            
         case '#':
            alternate = true;
            break;
            
         case ' ':
            // this doesn't seem to make any difference with boost::format()
            break;
            
         case '0':
            pad_zero = true;
            break;
            
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
         case '*':
            state = state_width;
            do_next_char = false;
            scratch = "";
            break;

         case '.':
            state = state_precision;
            scratch = "";
            break;

         default:
            state = state_conv;
            do_next_char = false;
            break;
         }
      }
      else if(state === state_width)
      {
         switch(ch)
         {
         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
            scratch += ch;
            break;

         case '*':
            width = Number(arguments[current_argument++]);
            state = state_precision;
            break;
            
         case '.':
            width = Number(scratch);
            scratch = "";
            state = state_precision;
            break;

         default:
            width = Number(scratch);
            do_next_char = false;
            state = state_conv;
            break;
         }
      }
      else if(state === state_precision)
      {
         switch(ch)
         {
         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
            scratch += ch;
            break;

         case '*':
            precision = Number(arguments[current_argument++]);
            state = state_conv;
            break;

         default:
            precision = Number(scratch);
            do_next_char = false;
            state = state_conv;
            break;
         }
      }
      else if(state === state_conv)
      {
         switch(ch)
         {
         case 'd':              // integer conversion
         case 'i':
         case 'u':
            value = Number(arguments[current_argument++]);
            if(isNaN(value))
               rtn += "NAN";
            else if(value === Infinity)
               rtn += "+INF";
            else if(value === -Infinity)
               rtn += "-INF";
            else
            {
               if(value < 0 || add_sign)
               {
                  if(value < 0)
                  {
                     rtn += "-";
                     value = -value;
                  }
                  else
                     rtn += "+";
                  --width;
               }
               scratch = value.toFixed(0);
               if(scratch.length < width)
               {
                  if(left_justify)
                  {
                     rtn += scratch;
                     for(j = scratch.length; j < width; ++j)
                        rtn += ' ';
                  }
                  else
                  {
                     for(j = scratch.length; j < width; ++j)
                     {
                        if(pad_zero)
                           rtn += '0';
                        else
                           rtn += ' ';
                     }
                     rtn += scratch;
                  }
               }
               else
                  rtn += scratch;
            }
            break;

         case 'o':              // octal conversion
            value = Number(arguments[current_argument++]);
            if(isNaN(value))
               rtn += "NAN";
            else if(value === Infinity)
               rtn += "+INF";
            else if(value === -Infinity)
               rtn += "-INF";
            else
            {
               if(alternate)
               {
                  rtn += '0';
                  --width;
               }
               scratch = value.toString(8);
               if(scratch.length < width)
               {
                  if(left_justify)
                  {
                     rtn += scratch;
                     for(j = scratch.length; j < width; ++j)
                        rtn += ' ';
                  }
                  else
                  {
                     for(j = scratch.length; j < width; ++j)
                     {
                        if(pad_zero)
                           rtn += '0';
                        else
                           rtn += ' ';
                     }
                     rtn += scratch;
                  }
               }
               else
                  rtn += scratch;
            }
            break;
            
         case 'x':
         case 'X':              // hex conversion
            value = Number(arguments[current_argument++]);
            if(isNaN(value))
               rtn += "NAN";
            else if(value === Infinity)
               rtn += "+INF";
            else if(value === -Infinity)
               rtn += "-INF";
            else
            {
               if(alternate)
               {
                  if(ch === 'x')
                     rtn += "0x";
                  else
                     rtn += "0X";
                  width -= 2;
               }
               scratch = value.toString(16);
               if(ch === 'X')
                  scratch = scratch.toUpperCase();
               if(scratch.length < width)
               {
                  if(left_justify)
                  {
                     rtn += scratch;
                     for(j = scratch.length; j < width; ++j)
                        rtn += ' ';
                  }
                  else
                  {
                     for(j = scratch.length; j < width; ++j)
                     {
                        if(pad_zero)
                           rtn += '0';
                        else
                           rtn += ' ';
                     }
                     rtn += scratch;
                  }
               }
               else
                  rtn += scratch;
            }
            break;

         case 'c':              // convert character encoding
            value = Number(arguments[current_argument++]);
            scratch = String.fromCharCode(value);
            if(scratch.length < width)
            {
               if(left_justify)
               {
                  rtn += scratch;
                  for(j = scratch.length; j < width; ++j)
                     rtn += ' ';
               }
               else
               {
                  for(j = scratch.length; j < width; ++j)
                     rtn += ' ';
                  rtn += scratch;
               }
            }
            else
               rtn += scratch;
            break;

         case 's':              // convert string
            value = String(arguments[current_argument++]);
            scratch = value;
            if(scratch.length < width)
            {
               if(left_justify)
               {
                  rtn += scratch;
                  for(j = scratch.length; j < width; ++j)
                     rtn += ' ';
               }
               else
               {
                  for(j = scratch.length; j < width; ++j)
                     rtn += ' ';
                  rtn += scratch;
               }
            }
            else
               rtn += scratch;
            break;

         case 'e':
         case 'E':
         case 'f':
         case 'g':
         case 'G':
         case 'n':
            if(ch === 'n')
               value = current_argument;
            else
               value = Number(arguments[current_argument++]);
            if(add_sign || value < 0)
            {
               if(value < 0)
               {
                  value = -value;
                  rtn += '-';
               }
               else
                  rtn += '+';
               --width;
            }
            scratch = sprintf.convert_value(value, ch, precision, thousands_sep, decimal_point);
            if(scratch.length < width)
            {
               if(left_justify)
               {
                  rtn += scratch;
                  for(j = scratch.length; j < width; ++j)
                     rtn += ' ';
               }
               else
               {
                  for(j = scratch.length; j < width; ++j)
                  {
                     if(pad_zero)
                        rtn += '0';
                     else
                        rtn += ' ';
                  }
                  rtn += scratch;
               }
            }
            else
               rtn += scratch;
            break;
            
         default:
            // @todo: throw an exception for an invalid format converter
            break;
         }
         state = state_normal;
      }
      if(do_next_char)
         ++i;
   }
   return rtn;
} // sprintf


sprintf.convert_value = function (value, format, precision, thousands_sep, decimal_point, trim_trailing_zeroes)
{
   var rtn;
   var temp = value;
   var separator_pos;
   var array;

   if(trim_trailing_zeroes === undefined)
      trim_trailing_zeroes = true;
   if(isNaN(value))
      rtn += "NAN";
   else if(value === Infinity)
      rtn += "+INF";
   else if(value === -Infinity)
      rtn = "-INF";
   else
   {
      switch(format)
      {
      case 'f':
         rtn = value.toFixed(precision);
         break;
         
      case 'e':
      case 'E':
         rtn = value.toExponential(precision);
         if(format === 'E')
            rtn = rtn.toUpperCase();
         break;
         
      case 'g':
      case 'G':
         if((!trim_trailing_zeroes && Math.abs(value) < 1E-4) || Math.abs(value) > 1E5)
            rtn = value.toExponential(precision - 1);
         else
            rtn = value.toPrecision(precision);
         if(format === 'G')
            rtn = rtn.toUpperCase();
         if(trim_trailing_zeroes)
            rtn = sprintf.trim_trailing_zeroes(rtn);
         break;
      }
      
      // we need to replace the decimal point with the locale decimal point character
      if(decimal_point.localeCompare('.') !== 0)
         rtn = rtn.replace(".", decimal_point);
      
      // we also need to insert thousands separators 
      if(value >= 1000)
      {
         temp = value;
         array = Csi.string_to_array(rtn);
         separator_pos = rtn.indexOf(decimal_point);
         if(separator_pos < 0)
            separator_pos = rtn.length;
         separator_pos -= 3;
         while(temp >= 1000 && separator_pos > 0)
         {
            array.splice(separator_pos, 0, thousands_sep);
            separator_pos -= 3;
            temp /= 1000;
         }
         rtn = array.join("");
      }
   }
   return rtn;
};


sprintf.trim_trailing_zeroes = function (s)
{
   // we need to trim any zeroes trailing the decimal point but
   // preceding the exponent. 
   var array = Csi.string_to_array(s);
   var exp_pos = s.search(/[eE][+\-].\d*$/);
   var dec_point_pos = s.search(/\.\d*0*/);
   var i;

   if(exp_pos < 0)
      exp_pos = array.length;
   if(dec_point_pos >= 0)
   {
      for(i = exp_pos - 1; i >= dec_point_pos; --i)
      {
         if(array[i] === '0' || array[i] === '.')
            array[i] = '';
         else
            break;
      }
   }

   // trim off the exponent if it has a value of zero. 
   if(exp_pos < s.length)
   {
      var delete_exp = true;
      for(i = exp_pos; i < array.length; ++i)
      {
         if(array[i] !== 'e' && array[i] !== 'E' && array[i] !== '+' &&
            array[i] !== '-' && array[i] !== '0')
         {
            delete_exp = false;
            break;
         }
      }
      if(delete_exp)
      {
         for(i = exp_pos; i < array.length; ++i)
            array[i] = '';
      }
   }
   return array.join("");
};

/* CsiLgrDate.js

   Copyright (C) 2010, 2017 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Friday 09 July 2010
   Last Change: Tuesday 07 November 2017
   Last Commit: $Date: 2019-01-25 11:54:02 -0700 (Fri, 25 Jan 2019) $
   Last Changed by: $Author: jdevey $

*/

////////////////////////////////////////////////////////////
// class CsiLgrDate
//
// Defines an object that is capable of storing a datalogger time stamp with a
// resolution of milli-seconds.  Internally, this  class will maintain the
// date/time as milli-seconds elapsed since midnight 1 January 1990.
//
// This class has been adapted from the original DateTime class that was written by Wayne
// Campbell and uses concepts from the following articles:
//
//  Dr. Dobb's Journal #80, June 1983 
//     True Julian dates as used by astronomers take noon, 1 January 4713 BC as their base. We
//     will use the same base but base from midnight rather than noon.
//
//  Collected Algorithms from CACM - Algorithm 199
//     1 March 1900 = Julian Day 2415080 (noon based)
//     1 January 0000 = Julian Day 1721119
//     1 January 1970 = Julian Day 2440588
//     1 January 1980 = Julian day 2444240
//     1 January 1970 fell on a Thursday
//     The difference between 1 January 1990 and 1 January 1970 is 631,152,000
//     seconds or 7,305 days
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
// constructor
////////////////////////////////////////////////////////////
function CsiLgrDate()
{
   if(arguments.length > 0)
   {
      var arg1 = arguments[0];
      var arg1_type = typeof arg1;
      this.milliSecs = 0;
      if(arg1_type === "string")
      {
         this.milliSecs = CsiLgrDate.fromStr(arg1).milliSecs;
      }
      else if(arg1 instanceof Date)
      {
         this.milliSecs = arg1.getTime();
         this.milliSecs -= arg1.getTimezoneOffset() * CsiLgrDate.msecPerMin;
         this.milliSecs -= CsiLgrDate.unix_to_csi_diff * CsiLgrDate.msecPerDay;
      }
      else if(arg1 instanceof CsiLgrDate)
      {
         this.milliSecs = arg1.milliSecs;
      }
      else if(arg1_type === "number" || arg1 instanceof Number)
      {
         if(arguments.length === 1)
         {
            this.milliSecs = arg1;
         }
         else
         {
            var year = arg1;
            var month = 0;
            var day = 1;
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var millis = 0;
            if(arguments.length > 1)
            {
               month = arguments[1];
            }
            if(arguments.length > 2)
            {
               month = arguments[2];
            }
            if(arguments.length > 3)
            {
               day = arguments[3];
            }
            if(arguments.length > 4)
            {
               hours = arguments[4];
            }
            if(arguments.length > 5)
            {
               minutes = arguments[5];
            }
            if(arguments.length > 6)
            {
               seconds = arguments[6];
            }
            if(arguments.length > 7)
            {
               millis = arguments[7];
            }
            this.setDate(year, month, day);
            this.setTime(hours, minutes, seconds, millis);
         }
      }
      else
      {
         this.milliSecs = 0;
      }
   }
   else
   {
      this.milliSecs = 0;
   }
}

CsiLgrDate.nsecPerUSec = 1000;
CsiLgrDate.nsecPerMSec = CsiLgrDate.nsecPerUSec * 1000;
CsiLgrDate.nsecPerSec = CsiLgrDate.nsecPerMSec * 1000;
CsiLgrDate.msecPerSec = 1000;
CsiLgrDate.msecPerMin = CsiLgrDate.msecPerSec * 60;
CsiLgrDate.msecPerHour = CsiLgrDate.msecPerMin * 60;
CsiLgrDate.msecPerDay = CsiLgrDate.msecPerHour * 24;
CsiLgrDate.msecPerWeek = CsiLgrDate.msecPerDay * 7;
CsiLgrDate.julDay0 = 1721119;
CsiLgrDate.julDay1970 = 2440588;
CsiLgrDate.unix_to_csi_diff = 7305;
CsiLgrDate.julDay1990 = CsiLgrDate.julDay1970 + CsiLgrDate.unix_to_csi_diff;


CsiLgrDate.leap_year = function (year)
{ return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0); };

////////////////////////////////////////////////////////////
// setDate
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.setDate = function ()
{
   // interpret the arguments.  We will perform input bounds checking while
   // doing this
   var year = 1990;
   var month = 1;
   var day = 1;
   var month_lens = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
   if(arguments.length >= 1)
   {
      year = Number(arguments[0]);
   }
   if(CsiLgrDate.leap_year(year))
   {
      month_lens[1] += 1;
   }
   if(arguments.length >= 2)
   {
      month = Number(arguments[1]);
      if(month < 1)
      {
         month = 1;
      }
      if(month > 12)
      {
         month = 12;
      }
   }
   if(arguments.length >= 3)
   {
      day = Number(arguments[2]);
      if(day < 1)
      {
         day = 1;
      }
      if(day > month_lens[month - 1])
      {
         day = month_lens[month - 1];
      }
   }

   // preserve the time information and separate the century and year
   var time = this.toTime();
   var century;
   var year_of_century;
   var y, m;
   if(month >= 3)
   {
      m = month - 3;
      y = year;
   }
   else
   {
      m = month + 9;
      y = year - 1;
   }
   century = Math.floor(y / 100);
   year_of_century = y % 100;

   // we can now calculate the number of days since 1 January 0000
   var days_cent = Math.floor((146097 * century) / 4);
   var days_ano = Math.floor((1461 * year_of_century) / 4);
   var days_mes = Math.floor((153 * m + 2) / 5);
   var days = days_cent + days_ano + days_mes + day;
   days -= CsiLgrDate.julDay1990 - CsiLgrDate.julDay0;
   this.milliSecs = days * CsiLgrDate.msecPerDay +
         time.hour * CsiLgrDate.msecPerHour +
         time.minute * CsiLgrDate.msecPerMin +
         time.second * CsiLgrDate.msecPerSec +
         time.msec;
};

////////////////////////////////////////////////////////////
// truediv
////////////////////////////////////////////////////////////
CsiLgrDate.truediv = function (numerator, denominator)
{
   var quotient = numerator / denominator;
   var remainder = numerator % denominator;
   if(remainder < 0)
   {
      --quotient;
      remainder += denominator;
   }
   return {
      "quotient": Math.floor(quotient),
      "remainder": Math.floor(remainder)
   };
};

////////////////////////////////////////////////////////////
// setTime
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.setTime = function ()
{
   // process the parameters
   var hour = 0;
   var minute = 0;
   var second = 0;
   var msec = 0;

   if(arguments.length >= 1)
   {
      hour = arguments[0];
      if(hour > 24)
      {
         hour = 24;
      }
   }
   if(arguments.length >= 2)
   {
      minute = arguments[1];
      if(minute > 59)
      {
         minute = 59;
      }
   }
   if(arguments.length >= 3)
   {
      second = arguments[2];
      if(second > 59)
      {
         second = 59;
      }
   }
   if(arguments.length >= 4)
   {
      msec = arguments[3];
      if(msec > CsiLgrDate.msecPerSec)
      {
         msec = CsiLgrDate.msecPerSec;
      }
   }

   // we now need to strip off the current time of the timestamp.  We can then add the new values
   var qr = CsiLgrDate.truediv(this.milliSecs, CsiLgrDate.msecPerDay);
   this.milliSecs -= qr.remainder;
   this.milliSecs += hour * CsiLgrDate.msecPerHour +
         minute * CsiLgrDate.msecPerMin +
         second * CsiLgrDate.msecPerSec +
         msec;
};

////////////////////////////////////////////////////////////
// setMSec
//
// Sets the milli-seconds within the seconds leaving the rest of the date
// and time alone.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.setMSec = function (msec)
{
   var qr = CsiLgrDate.truediv(this.milliSecs, CsiLgrDate.msecPerSec);
   this.milliSecs = this.milliSecs - qr.quotient + msec;
};

////////////////////////////////////////////////////////////
// toDate
//
// Breaks the date down into the year, month, and day components.  These
// values will be returned as an object.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.toDate = function ()
{
   // we will express the stamp in terms of days since 1990
   var qr = CsiLgrDate.truediv(this.milliSecs, CsiLgrDate.msecPerDay);

   // we can now calulate the number of days since 1 January 0000 and strip off the century
   var clk = CsiLgrDate.julDay1990 - CsiLgrDate.julDay0 + qr.quotient;
   var year = Math.floor((4 * clk - 1) / 146097);
   var month;
   var day;

   clk = 4 * clk - 1 - year * 146097;

   // we can now strip off the year into the century, month, and day
   var d = Math.floor(clk / 4);

   clk = Math.floor((4 * d + 3) / 1461);
   d = 4 * d + 3 - clk * 1461;
   d = Math.floor((d + 4) / 4);
   month = Math.floor((5 * d - 3) / 153);
   d = 5 * d - 3 - month * 153;
   day = Math.floor((d + 5) / 5);
   year = 100 * year + clk;
   if(month < 10)
   {
      month += 3;
   }
   else
   {
      month -= 9;
      ++year;
   }
   return {
      "year": year,
      "month": month,
      "day": day
   };
};

////////////////////////////////////////////////////////////
// toTime
//
// Breaks down the time portion into hours, minutes, seconds, and milli-seconds
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.toTime = function ()
{
   var qr = CsiLgrDate.truediv(this.milliSecs, CsiLgrDate.msecPerSec);
   var rtn = {
      "hour": 0,
      "minute": 0,
      "second": 0,
      "msec": qr.remainder
   };

   qr = CsiLgrDate.truediv(qr.quotient, 60);
   rtn.second = qr.remainder;
   qr = CsiLgrDate.truediv(qr.quotient, 60);
   rtn.minute = qr.remainder;
   qr = CsiLgrDate.truediv(qr.quotient, 24);
   rtn.hour = qr.remainder;
   return rtn;
};


CsiLgrDate.prototype.julianDate = function ()
{ 
   var rtn = 0.0;

   var y = this.year();
   var mon = this.month();
   var d = this.day();
   var h = this.hour();
   var min = this.minute();
   var s = this.second() + this.msec() / CsiLgrDate.msecPerSec;

   //Formula to convert gregorian date to julian date
   rtn = d - 32075 + 1461 * (y + 4800 + (mon - 14) / 12) / 4 + 367 *
      (mon - 2 - (mon - 14) / 12 * 12) / 12 - 3 * ((y + 4900 + (mon - 14) / 12) / 100) / 4;
   rtn = Math.floor(rtn);


   var time = (h + 12) / 24 + min / 1440 + s / 86400;
   rtn += time;

   return rtn;
};


////////////////////////////////////////////////////////////
// year
//
// Returns the year for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.year = function ()
{ return this.toDate().year; };

////////////////////////////////////////////////////////////
// month
//
// Returns the month of the year for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.month = function ()
{ return this.toDate().month; };

////////////////////////////////////////////////////////////
// day
//
// Returns the day of the month for this stamp
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.day = function ()
{ return this.toDate().day; };

////////////////////////////////////////////////////////////
// hour
//
// Returns the hour of the day for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.hour = function ()
{ return this.toTime().hour; };

////////////////////////////////////////////////////////////
// minute
//
// Returns the minutes into the hour for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.minute = function ()
{ return this.toTime().minute; };

////////////////////////////////////////////////////////////
// second
//
// Returns the seconds into the minute for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.second = function ()
{ return this.toTime().second; };

////////////////////////////////////////////////////////////
// msec
//
// Returns the milliseconds into the second for this stamp.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.msec = function ()
{ return this.toTime().msec; };

////////////////////////////////////////////////////////////
// dayOfWeek
//
// Returns day of the week for this stamp such that 0 < dayOfWeek <= 7
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.dayOfWeek = function ()
{
   var days = Math.floor(
      this.milliSecs / CsiLgrDate.msecPerDay + CsiLgrDate.julDay1990 - CsiLgrDate.julDay0);
   return ((days + 2) % 7) + 1;
};

////////////////////////////////////////////////////////////
// dayOfYear
//
// Returns the day of the year for this stamp such that 0 < dayOfYear() <= 366.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.dayOfYear = function ()
{
   var year_start = new CsiLgrDate();
   year_start.setDate(this.year());
   return Math.floor(
      ((this.milliSecs - year_start.milliSecs) / CsiLgrDate.msecPerDay) + 1);
};

////////////////////////////////////////////////////////////
// make_date
//
// Generates a Javascript Date object from this timestamp.  
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.make_date = function ()
{
   var date = this.toDate();
   var time = this.toTime();
   return new Date(
      date.year, date.month - 1, date.day,
      time.hour, time.minute, time.second, time.msec);
};

////////////////////////////////////////////////////////////
// getTime
//
// Converts our epoch into the epoch used for the JavaScript Date class.  
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.getTime = function ()
{ return this.make_date().getTime(); };

////////////////////////////////////////////////////////////
// fromStr
//
// Attempts to parse a time stamp from a string. 
////////////////////////////////////////////////////////////
CsiLgrDate.fromStr = function (s)
{
   var rtn;
   var tokens = CsiLgrDate.make_tokens(s);
   var format = CsiLgrDate.determine_format(tokens);
   switch(format)
   {
      case 1:
         rtn = CsiLgrDate.read_format1(tokens);
         break;

      case 2:
         rtn = CsiLgrDate.read_format2(tokens);
         break;

      case 3:
         rtn = CsiLgrDate.read_format3(tokens);
         break;

      case 4:
         rtn = CsiLgrDate.read_format4(tokens);
         break;

      case 5:
         rtn = CsiLgrDate.read_format5(tokens);
         break;

      case 6:
         rtn = CsiLgrDate.read_format6(tokens);
         break;

      case 7:
         rtn = CsiLgrDate.read_format7(tokens);
         break;

      default:
         rtn = new CsiLgrDate();
         rtn.milliSecs = NaN;
         break;
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// gmt
//
// Constructs a new CsiLgrDate using the current system time in GMT.
////////////////////////////////////////////////////////////
CsiLgrDate.gmt = function ()
{
   var now = new Date();
   return new CsiLgrDate(now.getTime() - CsiLgrDate.unix_to_csi_diff * CsiLgrDate.msecPerDay);
};

////////////////////////////////////////////////////////////
// local
//
// Constructs a new CsiLgrDate using the current system time and local time zone
////////////////////////////////////////////////////////////
CsiLgrDate.local = function ()
{ return new CsiLgrDate(new Date()); };

////////////////////////////////////////////////////////////
// format
//
// Formats the date and time according to the strfime() type format
// string.  The following set of codes are recognised:
//
//   %a  -  abbreviated weekday name according to locale
//   %A  -  full weekday name according to locale
//   %b  -  abbreviated month name according to locale
//   %B  -  Full month name according to locale
//   %c  -  Local date and time representation (Short Version)
//   %#c -  Local date and time representation (Long Version)
//   %d  -  day of month, two spaces, rights justified, padded with zero
//   %H  -  hours into the day, two spaces right justified, padded with zero
//   %#H -  hours into the day similar to %H.  If the time is between 0:00:00
//          and 0:00:59, the hour will be formatted as 24 and the previous day
//          will be used. 
//   %I  -  Hour with 12 hour clock, two spaces right justified, padded with zero
//   %j  -  Day of year, three spaces right justified, padded with zero
//   %m  -  numeric month, two spaces right justified, padded with zero
//   %M  -  minutes into the hour, two spaces, rights justified, padded with zero
//   %p  -  local equivalent of "AM" or "PM" specifier
//   %S  -  seconds into the minute, two spaces, right justified, padded with zero
//   %U  -  week number of the year (Sunday being the first day of the week)
//   %w  -  day of week as an integer, one space
//   %W  -  week number of the year (Monday being the first day of the week)
//   %y  -  years into century, two spaces, rights justified, padded with zero
//   %Y  -  year as an integer
//   %1  -  tenths of seconds, one space
//   %2  -  hundredths of seconds, two spaces, rights justified, padded with zero
//   %3  -  thousands of seconds, three spaces, right justified, padded with zero
//   %4  -  1/10000 of second, four spaces, right justified, padded with zero
//   %5  -  1/100000 of second, five spaces, right justified, padded with zero
//   %6  -  micro-seconds, six spaces, right justified, padded with zero
//   %7  -  1/10000000 of second, seven spaces, right justified, padded with zero
//   %8  -  1/100000000 of seconds, eight spaces, right justified, padded with zero
//   %9  -  nano-seconds, nine spaces, right justified, padded with zero
//   %x  -  prints the sub-second resolution of the stamp with a preceding period with no padding
//   %X  -  local time representation
//   %n  -  local date representation (%x conflicts with previous usage)
//   %Z  -  Time zone name
//   %%  -  Prints the '%' character
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.format = function (spec)
{
   // break the date into its component parts. 
   var abbrev_days = [
      "Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
   var full_days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   var abbrev_months = [
      "Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   var full_months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
   var rtn = "";
   var last_char = 0;
   var len = spec.length;
   var time_zone_pos;
   var temp;
   var date = this.toDate();
   var time = this.toTime();
   var jsdate = this.make_date();
   var year_start;
   var week1_start_day;
   var this_day;
   var weeks;
   var gmt_offset = null;
   
   // if the hour represents midnight, we may need to adjust this date and print hours as 24.
   if(time.hour === 0 && time.minute === 0)
   {
      // search the format string for an instance of "%#H", if present, we will replace it
      // with 24 and reformat with the previous days date.
      var flagged_day_pos = spec.search(/%#H/);
      if(flagged_day_pos > 0)
      {
         var new_date = new CsiLgrDate(this.milliSecs - CsiLgrDate.msecPerDay);
         return new_date.format(spec.replace(/%#H/, "24"));
      }
   }

   var i;
   for(i = 0; i < len; ++i)
   {
      if(last_char !== '%' && spec.charAt(i) !== '%')
      {
         rtn += spec.charAt(i);
      }
      else if(last_char === '%')
      {
         var flagged = (spec.charAt(i) === '#');
         if(flagged && i + 1 < spec.length)
         {
            ++i;
         }
         switch(spec.charAt(i))
         {
         case '%':
            rtn += '%';
            if(i + 1 < len)
            {
               ++i;
               rtn += spec.charAt(i);
            }
            break;
            
         case 'a':
            rtn += abbrev_days[this.dayOfWeek() - 1];
            break;
            
         case 'A':
            rtn += full_days[this.dayOfWeek() - 1];
            break;
            
         case 'b':
            rtn += abbrev_months[date.month - 1];
            break;
            
         case 'B':
            rtn += full_months[date.month - 1];
            break;
            
         case 'c':
            if(flagged)
            {
               temp = jsdate.toLocaleString(
                  [],
                  {
                     weekday:"long",
                     year:"numeric",
                     month:"long",
                     day:"numeric",
                     hour:"numeric",
                     minute:"numeric",
                     second:"numeric"
                  });
               time_zone_pos = temp.lastIndexOf(" GMT");
               if(time_zone_pos >= 0)
                  rtn += temp.slice(0, time_zone_pos);
               else
                  rtn += temp;
            }
            else
            {
               temp = jsdate.toLocaleString(
                  [],
                  {
                     year:"numeric",
                     month:"numeric",
                     day:"numeric",
                     hour:"numeric",
                     minute:"numeric",
                     second:"numeric"
                     });
               time_zone_pos = temp.lastIndexOf(" GMT");
               if(time_zone_pos >= 0)
                  rtn += temp.slice(0, time_zone_pos);
               else
                  rtn += temp;
            }
            break;
            
         case 'Z':
            temp = jsdate.toTimeString();
            time_zone_pos = temp.lastIndexOf(" GMT");
            if(time_zone_pos >= 0)
               rtn += temp.slice(time_zone_pos, temp.length);
            break;
            
         case 'z':
            gmt_offset = this.gmt_offset() / CsiLgrDate.msecPerMin;
            rtn += (gmt_offset / 60);
            rtn += CsiLgrDate.pad_zero(gmt_offset % 60, 2);
            break;
            
         case 'd':
            rtn += CsiLgrDate.pad_zero(date.day, 2);
            break;
            
         case 'H':
            rtn += CsiLgrDate.pad_zero(time.hour, 2);
            break;
            
         case 'I':
            temp = time.hour % 12;
            if(temp === 0)
            {
               temp = 12;
            }
            rtn += CsiLgrDate.pad_zero(temp, 2);
            break;
            
         case 'j':
            rtn += CsiLgrDate.pad_zero(this.dayOfYear(), 3);
            break;

         case 'J':
            rtn += sprintf("%.10g", this.julianDate());
            break;

         case 'm':
            rtn += CsiLgrDate.pad_zero(date.month, 2);
            break;
            
         case 'M':
            rtn += CsiLgrDate.pad_zero(time.minute, 2);
            break;
            
         case 'n':
            rtn += jsdate.toLocaleDateString();
            break;
            
         case 'p':
            if(time.hour >= 12)
            {
               rtn += "PM";
            }
            else
            {
               rtn += "AM";
            }
            break;
            
         case 'S':
            rtn += CsiLgrDate.pad_zero(time.second, 2);
            break;
            
         case 'U':
            year_start = new CsiLgrDate(date.year, 1, 1);
            week1_start_day = year_start.dayOfWeek() - 1;
            this_day = this.dayOfYear();
            weeks = Math.ceil((this_day + week1_start_day) / 7) - 1;
            rtn += weeks.toString();
            break;
            
         case 'W':
            year_start = new CsiLgrDate(date.year, 1, 1);
            week1_start_day = year_start.dayOfWeek() - 1;
            week1_start_day = (week1_start_day + 6) % 7; // Only difference between Sunday start (%U) and Monday start (%W)
            this_day = this.dayOfYear();
            weeks = Math.ceil((this_day + week1_start_day) / 7) - 1;
            rtn += weeks.toString();
            break;
            
         case 'w':
            rtn += this.dayOfWeek() - 1;
            break;
            
         case 'X':
            rtn += jsdate.toLocaleTimeString();
            break;
            
         case 'y':
            rtn += CsiLgrDate.pad_zero(date.year % 100, 2);
            break;
            
         case 'Y':
            rtn += CsiLgrDate.pad_zero(date.year, 4);
            break;
            
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
            var digits = spec[i] - '0';
            var exponent = 9 - digits;
            var divisor = 1;
            var j;
            for(j = 0; j < exponent; ++j)
            {
               divisor *= 10;
            }
            rtn += CsiLgrDate.pad_zero(
               Math.floor((time.msec * CsiLgrDate.nsecPerMSec) / divisor),
               digits);
            break;
            
         case 'x':
            if(time.msec > 0)
            {
               temp = time.msec.toString();
               rtn += ".";
               if(temp.length === 1)
               {
                  rtn += "00";
               }
               else if(temp.length === 2)
               {
                  rtn += "0";
               }
               rtn += temp;
            }
            break;
         }
      }
      last_char = spec.charAt(i);
   }
   return rtn;
};


////////////////////////////////////////////////////////////
// gmt_offset
//
// Returns the offset between this time and GMT in units of milliseconds.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.gmt_offset = function()
{
   var date = this.make_date();
   return -date.getTimezoneOffset() * CsiLgrDate.msecPerMin;
};


////////////////////////////////////////////////////////////
// toString
//
// Overloads the regular toString to format the date
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.toString = function ()
{ return this.format("%Y-%m-%d %H:%M:%S%x"); };

////////////////////////////////////////////////////////////
// valueOf
//
// Overrides the regular valueOf to return the internal representation.
////////////////////////////////////////////////////////////
CsiLgrDate.prototype.valueOf = function ()
{ return this.milliSecs; };

////////////////////////////////////////////////////////////
// make_tokens
//
// Implements the algorithm  that will perform the lexical scanning for parsing
// date/time strings.
////////////////////////////////////////////////////////////
CsiLgrDate.make_tokens = function (buff)
{
   var token = "";
   var rtn = [];
   var last_ch = 0;

   var i;
   for(i = 0; i < buff.length; ++i)
   {
      // skip multiple spaces
      if(buff[i] === ' ' && last_ch === ' ')
      {
         continue;
      }
      last_ch = buff.charAt(i);

      // break the token if a delimiter is found
      switch(buff.charAt(i))
      {
         case '/':
         case '-':
         case ' ':
         case ';':
         case ':':
         case '.':
         case 'T':
            rtn.push(token);
            token = "";
            break;

         case ',':
            break;

         default:
            token += buff.charAt(i);
            break;
      }
   }

   // add the final token if there is any remainder
   if(token.length > 0)
   {
      rtn.push(token);
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// is_numeric
//
// Evaluates whether the string specified consists entirely of numeric
// characters.
////////////////////////////////////////////////////////////
CsiLgrDate.is_numeric = function (s)
{
   var rtn = true;
   var i;
   for(i = 0; rtn && i < s.length; ++i)
   {
      if(s[i] < '0' || s[i] > '9')
      {
         rtn = false;
      }
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// which_month
//
// Resolves the english name of a month or its abbreviation to a month code such that
// 0 <= which_month() < 12,
////////////////////////////////////////////////////////////
CsiLgrDate.which_month = function (s_)
{
   var rtn = -1;
   var s = s_.toLowerCase();
   var abbrev_month_names = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec"];
   var full_month_names = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december"];

   var i;
   for(i = 0; rtn < 0 && i < full_month_names.length; ++i)
   {
      if(s.localeCompare(abbrev_month_names[i]) === 0 ||
         s.localeCompare(full_month_names[i]) === 0)
      {
         rtn = i;
      }
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// determine_format
//
// Based upon the tokens that were generated from make_tokens(), this method
// will determine the specific format, if any, that the date/time string is
// using.  
////////////////////////////////////////////////////////////
CsiLgrDate.determine_format = function (tokens)
{
   var rtn = 0;
   if(tokens.length >= 2 &&
      CsiLgrDate.is_numeric(tokens[0]) &&
      tokens[0].length <= 2 &&
      CsiLgrDate.is_numeric(tokens[1]) &&
      tokens[1].length <= 2)
   {
      rtn = 1;
   }
   else if(tokens.length >= 1 &&
           CsiLgrDate.is_numeric(tokens[0]) &&
           (tokens[0].length === 6 || tokens[0].length === 8))
   {
      rtn = 3;
   }
   else if(tokens.length >= 3 &&
           CsiLgrDate.is_numeric(tokens[0]) &&
           tokens[0].length === 4 &&
           CsiLgrDate.is_numeric(tokens[1]) &&
           CsiLgrDate.is_numeric(tokens[2]))
   {
      rtn = 7;
   }
   else if(tokens.length >= 2 &&
           CsiLgrDate.which_month(tokens[0]) >= 0)
   {
      rtn = 4;
   }
   else if(tokens.length >= 2 && CsiLgrDate.which_month(tokens[1]) >= 0)
   {
      rtn = 5;
   }
   else if(tokens.length >= 1 && CsiLgrDate.is_numeric(tokens[0]))
   {
      rtn = 6;
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// read_time
//
// Parses the hours, minutes, seconds, and nsec from the time string. 
// //////////////////////////////////////////////////////////
CsiLgrDate.read_time = function (tokens, start)
{
   var rtn = {};
   rtn.hour = 0;
   rtn.minute = 0;
   rtn.second = 0;
   rtn.nsec = 0;
   var i, j;
   for(i = 0; i < tokens.length; ++i)
   {
      switch(i - start)
      {
      case 0:
         rtn.hour = tokens[i];
         break;
         
      case 1:
         rtn.minute = tokens[i];
         break;
         
      case 2:
         rtn.second = tokens[i];
         break;
         
      case 3:
         rtn.nsec = tokens[i];
         for(j = 9 - tokens[i].length; j > 0; --j)
         {
            rtn.nsec *= 10;
         }
         break;

      case 4:
         if(tokens[i] === "PM" || tokens[i] === "pm")
            rtn.hour += 12;
         break;
      }
   }
   return rtn;
};

////////////////////////////////////////////////////////////
// convert_components
//
// Converts the specified components into a LgrDate
////////////////////////////////////////////////////////////
CsiLgrDate.convert_components = function (year, month, day, hour, minute, second, nsec)
{
   if(typeof year === 'string')
      year = parseInt(year);

   if(typeof month === 'string')
      month = parseInt(month);

   if(typeof day === 'string')
      day = parseInt(day);

   if(typeof hour === 'string')
      hour = parseInt(hour);

   if(typeof minute === 'string')
      minute = parseInt(minute);

   if(typeof second === 'string')
      second = parseInt(second);

   if(typeof nsec === 'string')
      nsec = parseInt(nsec);

   var rtn = new CsiLgrDate();
   if(year < 100 && year >= 50)
   {
      year += 1900;
   }
   else if(year < 100 && year < 50)
   {
      year += 2000;
   }
   rtn.setDate(year, month, day);
   rtn.setTime(hour, minute, second, Math.floor(nsec / CsiLgrDate.nsecPerMSec));
   return rtn;
};

////////////////////////////////////////////////////////////
// read_format1
////////////////////////////////////////////////////////////
CsiLgrDate.read_format1 = function (tokens)
{
   var month = tokens[0];
   var day = tokens[1];
   var year = tokens[2];
   var time = CsiLgrDate.read_time(tokens, 3);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format2
////////////////////////////////////////////////////////////
CsiLgrDate.read_format2 = function (tokens)
{
   var day = tokens[0];
   var month = tokens[1];
   var year = tokens[2];
   var time = CsiLgrDate.read_time(tokens, 3);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format3
////////////////////////////////////////////////////////////
CsiLgrDate.read_format3 = function (tokens)
{
   var code = tokens[0];
   var day = Math.floor(code % 100);
   code /= 100;
   var month = Math.floor(code % 100);
   code /= 100;
   var year = Math.floor(code);
   var time = CsiLgrDate.read_time(tokens, 1);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format4
////////////////////////////////////////////////////////////
CsiLgrDate.read_format4 = function (tokens)
{
   var month = CsiLgrDate.which_month(tokens[0]) + 1;
   var day = tokens[1];
   var year = tokens[2];
   var time = CsiLgrDate.read_time(tokens, 3);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format5
////////////////////////////////////////////////////////////
CsiLgrDate.read_format5 = function (tokens)
{
   var day = tokens[0];
   var month = CsiLgrDate.which_month(tokens[1]) + 1;
   var year = tokens[2];
   var time = CsiLgrDate.read_time(tokens, 3);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format6
////////////////////////////////////////////////////////////
CsiLgrDate.read_format6 = function (tokens)
{
   var time = CsiLgrDate.read_time(tokens, 0);
   return CsiLgrDate.convert_components(0, 0, 0, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// read_format7
////////////////////////////////////////////////////////////
CsiLgrDate.read_format7 = function (tokens)
{
   var year = tokens[0];
   var month = tokens[1];
   var day = tokens[2];
   var time = CsiLgrDate.read_time(tokens, 3);
   return CsiLgrDate.convert_components(year, month, day, time.hour, time.minute, time.second, time.nsec);
};

////////////////////////////////////////////////////////////
// pad_zero
//
// Right justifies a number with preceding zeroes. 
////////////////////////////////////////////////////////////
CsiLgrDate.pad_zero = function (val, places)
{
   var temp = val.toString();
   var rtn = "";
   var i;
   for(i = 0; temp.length + i < places; ++i)
   {
      rtn += "0";
   }
   rtn += temp;
   return rtn;
};


////////////////////////////////////////////////////////////
// csi_max_timestamp
//
// Evaluates two timestamps and returns the value that is greatest. 
////////////////////////////////////////////////////////////
CsiLgrDate.max = function (time1, time2)
{
   var rtn = new CsiLgrDate(time1);
   if(time2.milliSecs > time1.milliSecs)
   {
      rtn = new CsiLgrDate(time2);
   }
   return rtn;
};


/* CsiExprToken.js

   Copyright (C) 2018, 2020 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Tuesday 08 May 2018
   Last Change: Monday 29 July 2019
   Last Commit: $Date: 2020-04-21 08:18:10 -0600 (Tue, 21 Apr 2020) $
   Last Changed by: $Author: jbritt $

*/

/**
 * Defines a base class for all expression tokens.
 */
function CsiExprToken()
{ }
CsiExprToken.prec_default = 0xffff;
CsiExprToken.prec_semi_colon = 11;
CsiExprToken.prec_paren = 10;
CsiExprToken.prec_comma = 9;
CsiExprToken.prec_max_operator = 8;
CsiExprToken.prec_function = 7;
CsiExprToken.prec_negation = 6;
CsiExprToken.prec_expon = 5;
CsiExprToken.prec_mult_div_mod = 4;
CsiExprToken.prec_add_subtr = 3;
CsiExprToken.prec_comparator = 2;
CsiExprToken.prec_logic_op = 1;
CsiExprToken.prec_bit_op = 0;


/**
 * Specifies a registry of creation methods for various types of tokens.
 */
CsiExprToken.creators = {};


/**
 * Registers a creator method that will generate a token type identified by the
 * specified name.
 *
 * @param {string} key Specifies the key for the token type.
 *
 * @param {function} creator Specifies the function that will generate the token
 * object being requested.
 */
CsiExprToken.add_creator = function(key, creator)
{
   CsiExprToken.creators[key.toUpperCase()] = creator;
};


/**
 * Must be overloaded to evaluate the token by pushing or popping values on the specified operand stack.
 *
 * @param {array} stack Specifies the operand stack.
 *
 * @param {array} tokens Specifies the operation tokens list.
 */
CsiExprToken.prototype.evaluate = function(stack, tokens)
{ };


/**
 * @return {number} Can be overloaded to return the priority for this token.
 */
CsiExprToken.prototype.get_priority = function()
{ return CsiExprToken.prec_default; };


/**
 * @return {boolean} Can be overloaded to return true if this token represents a left parenthese.
 */
CsiExprToken.prototype.is_lparen = function()
{ return false; };


/**
 * @return {boolean} Can be overloaded to return true if this token represents a right parenthese.
 */
CsiExprToken.prototype.is_rparen = function()
{ return false; };


/**
 * @return {boolean} Returns true if the token is a semi-colon.
 */
CsiExprToken.prototype.is_semi_colon = function()
{ return false; };


/**
 * @return {boolean} Returns true if this token is a function.
 */
CsiExprToken.prototype.is_function = function()
{ return false; };


/**
 * @return {boolean} Can be overloaded to return true if this token is an operator.
 */
CsiExprToken.prototype.is_operator = function()
{ return false; };


/**
 * @return {boolean} Can be overloaded to return true if this token is a variable.
 */
CsiExprToken.prototype.is_variable = function()
{ return false; };


/**
 * @return {boolean} Can be overloaded to return true if this token is an operand.
 */
CsiExprToken.prototype.is_operand = function()
{ return false; };


/**
 * @return {boolean} Can be overloaded to return true if this token is a comma.
 */
CsiExprToken.prototype.is_comma = function()
{ return false; };


/**
 * Can be overloaded to clear variable length argument counts.
 */
CsiExprToken.prototype.clear_args_count = function()
{ };


/**
 * Can be overloaded to increment the variable length argument count.
 */
CsiExprToken.prototype.increment_args_count = function()
{ };

   
/**
 * Defines a left parenthese token
 */
function CsiLeftParen()
{ }
CsiLeftParen.prototype = new CsiExprToken();
CsiExprToken.add_creator("(", function() { return new CsiLeftParen(); });

CsiLeftParen.prototype.is_lparen = function()
{ return true; };

CsiLeftParen.prototype.get_priority = function()
{ return CsiExprToken.prec_paren; };


/**
 * Defines a right parenthese token.
 */
function CsiRightParen()
{ }
CsiRightParen.prototype = new CsiExprToken();
CsiExprToken.add_creator(")", function() { return new CsiRightParen(); });


CsiRightParen.prototype.is_rparen = function()
{ return true; };

CsiRightParen.prototype.get_priority = function()
{ return CsiExprToken.prec_paren; };


/**
 * Defines a semicolon operator.
 */
function CsiSemicolon()
{ }
CsiSemicolon.prototype = new CsiExprToken();
CsiExprToken.add_creator(";", function() { return new CsiSemicolon(); });


CsiSemicolon.prototype.get_priority = function()
{ return CsiExprToken.prec_semi_colon; };

CsiSemicolon.prototype.is_semi_colon = function()
{ return true; };


/**
 * Defines a comma operator.
 */
function CsiComma()
{ }
CsiComma.prototype = new CsiExprToken();
CsiExprToken.add_creator(",", function() { return new CsiComma(); });

                         
CsiComma.prototype.is_comma = function()
{ return true; };

CsiComma.prototype.get_priority = function()
{ return CsiExprToken.prec_comma; };

CsiComma.prototype.is_operator = function()
{ return true; };


/**
 * Defines an object that represents an operand.
 */
function CsiOperand()
{
   this.value = Number(0);
   this.value_type = CsiOperand.value_double;
   this.timestamp = new CsiLgrDate();
   if(arguments.length === 1)
   {
      this.value = arguments[0].value;
      this.value_type = arguments[0].value_type;
      this.timestamp = arguments[0].timestamp;
   }
   else if(arguments.length >= 2)
      this.set_val(arguments[0], arguments[1]);
}
CsiOperand.prototype = new CsiExprToken();
CsiOperand.value_double = 0;
CsiOperand.value_int = 1;
CsiOperand.value_string = 2;
CsiOperand.value_date = 3;


CsiOperand.prototype.is_operand = function()
{ return true; };


CsiOperand.prototype.evaluate = function(stack)
{
   stack.push(this);
};


CsiOperand.prototype.get_val = function()
{
   var rtn = 0;
   var temp;
   
   switch(this.value_type)
   {
   case CsiOperand.value_double:
   case CsiOperand.value_int:
      rtn = this.value;
      break;
      
   case CsiOperand.value_string:
      temp = this.value.toUpperCase();
      if(temp === "INF" || temp === "+INF")
         rtn = Infinity;
      else if(temp === "-INF")
         rtn = -Infinity;
      else if(temp === "NAN")
         rtn = NaN;
      else
         rtn = parseFloat(temp);
      break;
      
   case CsiOperand.value_date:
      rtn = this.value.milliSecs * CsiLgrDate.nsecPerMSec;
      break;
   }
   return rtn;
};


CsiOperand.prototype.get_val_str = function()
{
   var rtn = "";
   switch(this.value_type)
   {
   case CsiOperand.value_double:
      rtn = sprintf(this.value, "%g");
      break;
      
   case CsiOperand.value_int:
      rtn = sprintf(this.value, "%d");
      break;
      
   case CsiOperand.value_string:
      rtn = this.value;
      break;
      
   case CsiOperand.value_date:
      rtn = this.value.format("%Y-%m-%d %H:%M:%S%x");
      break;
   }
   return rtn;
};

CsiOperand.prototype.get_val_date = function ()
{
   var rtn = 0;
   switch (this.value_type) {
   
   case CsiOperand.value_double:
   case CsiOperand.value_int:
      rtn = new CsiLgrDate(this.value / CsiLgrDate.nsecPerMSec);
      break;      
   case CsiOperand.value_string:
      rtn = CsiLgrDate.fromStr(this.value);
      break;
   case CsiOperand.value_date:
         rtn = this.value;
      break;
   }
   return rtn;
};


CsiOperand.prototype.get_val_int = function()
{
   var rtn = 0;
   switch(this.value_type)
   {
   case CsiOperand.value_double:
      rtn = Math.floor(this.value);
      break;
      
   case CsiOperand.value_int:
      rtn = this.value;
      break;
      
   case CsiOperand.value_string:
      // if the string consists of all hex digits, we will convert it as hex
      if(this.value.search(/[a-fA-F0-9]+^/) === 0)
      {
         rtn = parseInt(this.value, 16);
      }
      else if(this.value.search(/[0-9]+^/) >= 0)
      {
         rtn = parseInt(this.value, 10);
      }
      else
      {
         // in order to honour exponential notation, we will first convert the
         // value to floating point and then to an integer.
         rtn = Math.floor(parseFloat(this.value));
      }
      break;
      
   case CsiOperand.value_date:
      rtn = this.value.milliSecs * CsiLgrDate.nsecPerMSec;
      break;
   }
   return rtn;
};


CsiOperand.prototype.set_val = function(value, timestamp)
{
   var value_type = typeof(value);
   switch(value_type)
   {
   case "number":
      this.value = value;
      this.value_type = CsiOperand.value_double;
      break;
      
   case "string":
      this.value = value;
      this.value_type = CsiOperand.value_string;
      break;
      
   case "boolean":
      if(value)
         this.value = -1;
      else
         this.value = 0;
      this.value_type = CsiOperand.value_int;
      break;
      
   case "object":
      if(value instanceof Number)
      {
         this.value = value;
         this.value_type = CsiOperand.value_double;
      }
      else if(value instanceof String)
      {
         this.value = value;
         this.value_type = CsiOperand.value_string;
      }
      else if(value instanceof Boolean)
      {
         this.value = (value ? -1 : 0);
         this.value_type = CsiOperand.value_int;
      }
      else if(value instanceof CsiLgrDate)
      {
         this.value = new CsiLgrDate(value);
         this.value_type = CsiOperand.value_date;
      }
      else if(value instanceof CsiOperand)
      {
         this.value = value.value;
         this.value_type = value.value_type; 
      }
      else
      {
         this.value = NaN;
         this.value_type = CsiOperand.value_double;
      }
   }
   this.timestamp = timestamp; 
};


CsiOperand.prototype.set_val_int = function(value, timestamp)
{
   this.set_val(value, timestamp);
   this.value = this.get_val_int();
   this.value_type = CsiOperand.value_int;
};


CsiOperand.prototype.valueOf = function()
{
   var rtn = NaN;
   switch(this.value_type)
   {
   case CsiOperand.value_double:
   case CsiOperand.value_int:
   case CsiOperand.value_string:
      rtn = this.value;
      break;
      
   case CsiOperand.value_date:
      rtn = this.value.milliSecs;
      break;
   }
   return rtn;
};


CsiOperand.prototype.toString = function()
{ return this.get_val_str(); };


/**
 *  
 * @param {CsiToken} value Defines a constant value which is either pre-defined or specified in the expression.
 */
function CsiConstant(value)
{
   this.set_val(value, new CsiLgrDate());
}
CsiConstant.prototype = new CsiOperand();
CsiExprToken.add_creator("NOPLOT", function() {
   return new CsiConstant(NaN);
});
CsiExprToken.add_creator("NAN", function() {
   return new CsiConstant(NaN);
});
CsiExprToken.add_creator("INF", function() {
   return new CsiConstant(Infinity);
});
CsiExprToken.add_creator("TRUE", function() {
   return new CsiConstant(-1);
});
CsiExprToken.add_creator("FALSE", function() {
   return new CsiConstant(0);
});
CsiExprToken.add_creator("PI", function() {
   return new CsiConstant(3.14159265359);
});
CsiExprToken.add_creator("e", function() {
   return new CsiConstant(2.718282);
});
CsiExprToken.add_creator("nsecPerUSec", function() {
   return new CsiConstant(CsiLgrDate.nsecPerUSec);
});
CsiExprToken.add_creator("nsecPerMSec", function() {
   return new CsiConstant(CsiLgrDate.nsecPerMSec);
});
CsiExprToken.add_creator("nsecPerMin", function() {
   return new CsiConstant(CsiLgrDate.nsecPerMin);
});
CsiExprToken.add_creator("nsecPerHour", function() {
   return new CsiConstant(CsiLgrDate.nsecPerHour);
});
CsiExprToken.add_creator("nsecPerDay", function() {
   return new CsiConstant(CsiLgrDate.nsecPerDay);
});
CsiExprToken.add_creator("nsecPerWeek", function() {
   return new CsiConstant(CsiLgrDate.nsecPerWeek);
});
CsiExprToken.add_creator("RESET_HOURLY", function() {
   return new CsiConstant(1);
});
CsiExprToken.add_creator("RESET_DAILY", function() {
   return new CsiConstant(2);
});
CsiExprToken.add_creator("RESET_WEEKLY", function() {
   return new CsiConstant(5);
});
CsiExprToken.add_creator("RESET_MONTHLY", function() {
   return new CsiConstant(3);
});
CsiExprToken.add_creator("RESET_YEARLY", function() {
   return new CsiConstant(4);
});
CsiExprToken.add_creator("RESET_CUSTOM", function() {
   return new CsiConstant(6);
});


CsiConstant.create_from_token = function(token)
{
   var rtn = null;
   var integer_regex = /^(\+|-)?\d+$/;
   var float_regex = /^[-+]?\d*\.?\d*([eE][-+]?\d+)?$/;
   
   if(token.length > 0)
   {
      rtn = new CsiConstant(NaN);
      if(token.charAt(0) === '&' && token.length > 2)
      {
         if(token.charAt(1) === 'h' || token.charAt(1) === 'H')
         {
            rtn.value = Number.parseInt(token.substr(2), 16);
            rtn.value_type = CsiOperand.value_int;
         }
         else if(token.charAt(1) === 'b' || token.charAt(1) === 'B')
         {
            rtn.value = Number.parseInt(token.substr(2), 2);
            rtn.value_type = CsiOperand.value_int;
         }
      }
      else if(token.charAt(0) === '$' && token.length >= 3 && token.charAt(1) === '\"' && token.charAt(token.length - 1) === '\"')
      {
         rtn.value = token.substr(2, token.length - 3);
         rtn.value_type = CsiOperand.value_string;
      }
      else if(integer_regex.test(token))
      {
         rtn.value = Number.parseInt(token);
         rtn.value_type = CsiOperand.value_int;
      }
      else if(float_regex.test(token))
      {
         rtn.value = Number.parseFloat(token);
         rtn.value_type = CsiOperand.value_double;
      }
      else
         rtn = null;
   }
   return rtn;
};


CsiConstant.prototype.is_constant = function()
{ return true; };


/**
 * Defines a variable within an expression.
 *
 * @param {string} name Specifies the name of this variable.
 */
function CsiExprVariable(name)
{
   this.name = name;
   this.has_been_set = false;
}
CsiExprVariable.prototype = new CsiOperand();

CsiExprVariable.prototype.is_variable = function()
{ return true; };

CsiExprVariable.prototype.set_val = function(value, timestamp)
{
   this.has_been_set = true;
   CsiOperand.prototype.set_val.call(this, value, timestamp);
};

CsiExprVariable.prototype.evaluate = function(stack)
{
   if(this.has_been_set)
      stack.push(this);
   else
      throw "variable " + this.name + " not set";
};

CsiExprVariable.prototype.reset = function()
{ this.has_been_set = false; };


/**
 * Defines a base class for functions.
 */
function CsiExprFunction()
{ }
CsiExprFunction.prototype = new CsiExprToken();

CsiExprFunction.prototype.get_priority = function()
{ return CsiExprToken.prec_function; };

CsiExprFunction.prototype.is_operator = function()
{ return true; };

CsiExprFunction.prototype.is_function = function()
{ return true; };


/**
 * @return {CsiToken} Returns a token generated for the specified key.
 *
 * @param {CsiToken} prev_token Specifies the token that was allocated for this expression previously.
 *
 * @param {string} name Specifies the token key.
 */
CsiExprToken.make_token = function(prev_token, name)
{
   var key = name.toUpperCase();
   var rtn = null;
   
   if(CsiExprToken.creators.hasOwnProperty(key))
      rtn = CsiExprToken.creators[key].call(prev_token, name);
   else
   {
      rtn = CsiConstant.create_from_token(name);
      if(rtn === null)
         rtn = new CsiExprVariable(name);
   }

   // we need to check for a unary operator
   if(!prev_token ||
      (prev_token.is_operator() && !prev_token.is_function()) ||
      prev_token.is_lparen() ||
      prev_token.is_semi_colon())
   {
      // we will ignore a unary plus.
      if(name === "+")
         rtn = null;
      else if(name === "-")
         rtn = new CsiNegation("-");
   }
   return rtn;
};

/* CsiVariable.js

   Copyright (C) 2010, 2011 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Friday 30 July 2010
   Last Change: Wednesday 30 March 2011
   Last Commit: $Date: 2013-02-26 12:30:08 -0700 (Tue, 26 Feb 2013) $
   Last Changed by: $Author: tmecham $

*/


////////////////////////////////////////////////////////////
// class CsiVariable
////////////////////////////////////////////////////////////
function CsiVariable(simpleUri, is_table)
{
   this.simpleUri = simpleUri;  //simple Uri is typically the FieldName
   this.is_table = is_table;
   this.ownerExpression = null; //owning expression
   this.fieldIndex = -1; //cached index into the json Fields
   this.recnum = 0;
   this.timestamp = 0;
   this.value = null; //current value of the variable
   this.type = "xsd:float";
}


CsiVariable.prototype.set_owner_expression = function(expression)
{ this.ownerExpression = expression; };


CsiVariable.prototype.evaluate = function (stack)
{
   if(this.type === "xsd:dateTime")
   {
      stack.push(new CsiOperand(CsiLgrDate.fromStr(this.value), this.timestamp));
   }
   else if(this.type === "xsd:boolean")
   {
      stack.push(new CsiOperand(this.value ? -1 : 0, this.timestamp));
   }
   else
   {
      stack.push(new CsiOperand(this.value, this.timestamp));
   }
};


CsiVariable.prototype.set_value = function (value, timestamp)
{
   this.timestamp = timestamp;
   if((this.type === "xsd:float" || this.type === "xsd:double") &&
      (typeof (value) === "string" || value instanceof String))
   {
      if(value === "NAN")
      {
         this.value = NaN;
      }
      else if(value === "+INF" || value === "INF")
      {
         this.value = Infinity;
      }
      else if(value === "-INF")
      {
         this.value = -Infinity;
      }
      else
      {
         this.value = value;
      }
   }
   else
   {
      this.value = value;
   }
};

/* CsiUtility.js

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Written by: Jon Trauntvein
Date Begun: Thursday 12 August 2010
Last Change: Friday 01 March 2019
Last Commit: $Date: 2020-06-01 19:22:28 -0600 (Mon, 01 Jun 2020) $
Last Changed by: $Author: jbritt $

*/


function csi_log(msg)
{
   if(typeof console === "object")
   {
      console.log(msg);
   }
}


function addToStyle (value)
{
   getStyleTextNode().nodeValue += "\n" + value;
}


function getStyleTextNode ()
{
   //get styleElement
   var styleElement;
   var styleElementSelector = $('style');
   if(styleElementSelector.length === 0)
   {
      styleElement = document.createElement("style");
      $("head").append(styleElement);
      styleElement.setAttribute("type", "text/css");
   }
   else
   {
      styleElement = styleElementSelector.get(0);
   }

   //get styleTextNode from styleElement
   var styleTextNode = null;
   if(!styleElement.childNodes || (styleElement.childNodes.length === 0)) 
   {
      styleTextNode = document.createTextNode("");
      styleElement.appendChild(styleTextNode);
   }
   else
   {
      styleTextNode = styleElement.firstChild;
   }

   return styleTextNode;
}


//floating point mod: x mod y
//25.5 mod 10 = 5.5
function fmod(x, y)
{
   //25.5 - (floor(25.5/10) * 10)
   //25.5 - (2 * 10) = 5.5
   return x - (Math.floor(x / y) * y);
}


////////////////////////////////////////////////////////////
// class Point
////////////////////////////////////////////////////////////
function Point()
{
   if(arguments.length === 2)
   {
      this.x = Number(arguments[0]); 
      this.y = Number(arguments[1]); 
   }
   else if(arguments.length === 1)
   {
      var arg = arguments[0]; 
      if(arg instanceof Point)
      {
         this.x = arg.x;
         this.y = arg.y;
      }
   }
}


Point.prototype.adjustForLines = function ()
{
   this.x = Math.floor(this.x) + 0.5;
   this.y = Math.floor(this.y) + 0.5;
};


Point.prototype.adjustForFill = function ()
{
   this.x = Math.floor(this.x);
   this.y = Math.floor(this.y);
};


Point.prototype.offset = function(dx, dy)
{
   this.x += dx;
   this.y += dy;
};


////////////////////////////////////////////////////////////
// function distance
//
// Calculates the distance between two points 
////////////////////////////////////////////////////////////
Point.distance = function(p1, p2)
{
   var dx = p1.x - p2.x;
   var dy = p1.y - p2.y;
   return Math.sqrt(dx*dx + dy*dy);
};


////////////////////////////////////////////////////////////
// class Rect
////////////////////////////////////////////////////////////
function Rect()
{
   var initialised = false;
   if(arguments.length === 4)
   {
      this.left = Number(arguments[0]); 
      this.top = Number(arguments[1]); 
      this.width = Number(arguments[2]); 
      this.height = Number(arguments[3]); 
      this.right = this.left + this.width;
      this.bottom = this.top + this.height;
      initialised = true;
   }
   else if(arguments.length === 1)
   {
      var arg0 = arguments[0]; 
      if(arg0 instanceof Rect)
      {
         this.left = arg0.left;
         this.top = arg0.top;
         this.width = arg0.width;
         this.height = arg0.height;
         this.right = arg0.right;
         this.bottom = arg0.bottom;
         initialised = true;
      }
   }
   if(!initialised)
   {
      this.left = this.top = this.width = this.height = 0;
      this.right = this.bottom = 0;
   }
}


Rect.prototype.set_top = function (top)
{
   this.top = top;
   this.bottom = this.top + this.height;
};


Rect.prototype.get_top = function()
{ return this.top; };


Rect.prototype.set_bottom = function (bottom)
{
   this.bottom = bottom;
   this.top = this.bottom - this.height;
};


Rect.prototype.get_bottom = function()
{
   if(this.bottom != this.top + this.height)
      this.updateBottom();
   return this.bottom;
};


Rect.prototype.set_width = function (width)
{
   this.width = width;
   this.right = this.left + width;
};


Rect.prototype.get_width = function()
{ return this.width; };


Rect.prototype.set_height = function (height)
{
   this.height = height;
   this.bottom = this.top + height;
};


Rect.prototype.get_height = function()
{ return this.height; };


Rect.prototype.set_left = function (left)
{
   this.left = left;
   this.right = left + this.width;
};


Rect.prototype.get_left = function()
{ return this.left; };


Rect.prototype.set_right = function (right)
{
   this.right = right;
   this.left = right - this.width;
};


Rect.prototype.get_right = function()
{
   if(this.right != this.left + this.width)
      this.right = this.left + this.width;
   return this.right;
};


Rect.prototype.updateRight = function ()
{
   this.right = this.left + this.width;
};


Rect.prototype.updateBottom = function ()
{
   this.bottom = this.top + this.height;
};


Rect.prototype.updateHeight = function ()
{
   this.height = this.bottom - this.top;
   if(this.height < 0)
   {
      this.height = 0;
      this.top = this.bottom;
   }
};


Rect.prototype.updateWidth = function ()
{
   this.width = this.right - this.left;
   if(this.width < 0)
   {
      this.width = 0;
      this.left = this.right;
   }
};


Rect.prototype.adjustForFill = function ()
{
   this.left = Math.floor(this.left);
   this.top = Math.floor(this.top);
   this.right = Math.floor(this.right);
   this.bottom = Math.floor(this.bottom);
   this.width = this.right - this.left;
   this.height = this.bottom - this.top;
};


Rect.prototype.adjustForLines = function ()
{
   this.left = Math.floor(this.left) + 0.5;
   this.top = Math.floor(this.top) + 0.5;
   this.right = Math.floor(this.right) + 0.5;
   this.bottom = Math.floor(this.bottom) + 0.5;
   this.width = this.right - this.left;
   this.height = this.bottom - this.top;
};


Rect.prototype.contains = function (point)
{
   var rtn = false;
   if(point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom)
   {
      rtn = true;
   }
   return rtn;
};


Rect.prototype.deflate = function (dx, dy)
{ this.inflate(-dx, -dy); };


Rect.prototype.inflate = function (dx, dy)
{
   if(-2 * dx > this.width)
   {
      // don't allow to deflate to eat more width than available
      this.left += this.width / 2;
      this.width = 0;
   }
   else
   {
      this.left -= dx;
      this.width += 2 * dx;
   }
   if(-2 * dy > this.height)
   {
      this.top += this.height / 2;
      this.height = 0;
   }
   else
   {
      this.top -= dy;
      this.height += 2 * dy;
   }
   this.updateRight();
   this.updateBottom();
};


Rect.prototype.intersect = function (other)
{
   var x2 = this.right;
   var y2 = this.bottom;
   if(this.left < other.left)
   {
      this.left = other.left;
   }
   if(this.top < other.top)
   {
      this.y = other.y;
   }
   if(x2 > other.right)
   {
      x2 = other.right;
   }
   if(y2 > other.bottom)
   {
      y2 = other.bottom;
   }
   this.width = x2 - this.left;
   this.height = y2 - this.top;
   if(this.width <= 0 || this.height <= 0)
   {
      this.width = this.height = 0.0;
   }
   this.updateRight();
   this.updateBottom();
   return this;
};


Rect.prototype.is_empty = function ()
{ return this.width <= 0 || this.height <= 0; };


Rect.prototype.offset = function (dx, dy)
{
   this.left += dx;
   this.top += dy;
   this.updateRight();
   this.updateBottom();
};


Rect.prototype.move = function (x, y)
{
   this.left = x;
   this.top = y;
   this.updateRight();
   this.updateBottom();
};


Rect.prototype.union = function (other)
{
   if(this.is_empty())
   {
      this.top = other.top;
      this.left = other.left;
      this.width = other.width;
      this.height = other.height;
      this.right = other.right;
      this.bottom = other.bottom;
   }
   else if(!other.is_empty())
   {
      var x1 = Math.min(this.left, other.left);
      var y1 = Math.min(this.top, other.top);
      var x2 = Math.max(this.right, other.right);
      var y2 = Math.max(this.bottom, other.bottom);

      this.left = x1;
      this.top = y1;
      this.width = x2 - x1;
      this.height = y2 - y1;
      this.right = this.left + this.width;
      this.bottom = this.top + this.height;
   }
   return this;
};


Rect.prototype.rotate = function (degrees)
{
   if(degrees === 90 || degrees === 270)
   {
      var temp = this.width;
      this.width = this.height;
      this.height = temp;
      this.updateRight();
      this.updateBottom();
   }
   else if(degrees !== 0 && degrees !== 180)
   {
      var theta = degreesToRadians(degrees);
      var old_width = this.width;
      var old_height = this.height;
      this.width = Math.abs(old_width * Math.cos(theta)) + Math.abs(old_height * Math.cos(Math.PI / 2 - theta));
      this.height = Math.abs(old_width * Math.sin(theta)) + Math.abs(old_height * Math.sin(Math.PI / 2 - theta));
      this.right = this.left + this.width;
      this.bottom = this.top + this.height;
   }
};


Rect.prototype.center = function (centre_x, centre_y)
{
   this.left = centre_x - this.width / 2;
   this.top = centre_y - this.height / 2;
   this.right = this.left + this.width;
   this.bottom = this.top + this.height;
};


Rect.prototype.center_x = function (center_x)
{
   this.left = center_x - this.width / 2;
   this.right = this.left + this.width;
};


Rect.prototype.center_y = function (center_y)
{
   this.top = center_y - this.height / 2;
   this.bottom = this.top + this.height;
};


Rect.prototype.get_center = function ()
{ return new Point(this.left + this.width / 2, this.top + this.height / 2); };


Rect.prototype.get_top_left = function ()
{ return new Point(this.left, this.top); };


Rect.prototype.get_bottom_left = function ()
{ return new Point(this.left, this.bottom); };


Rect.prototype.get_top_right = function ()
{ return new Point(this.right, this.top); };


Rect.prototype.get_bottom_right = function ()
{ return new Point(this.right, this.bottom); };


Rect.prototype.set_drag_point = function (drag_x, drag_y, org_x, org_y)
{
   if(drag_x < org_x)
   {
      this.left = drag_x;
      this.width = org_x - drag_x;
      this.right = org_x;
   }
   else
   {
      this.right = drag_x;
      this.width = drag_x - org_x;
      this.left = org_x;
   }
   if(drag_y < org_y)
   {
      this.top = drag_y;
      this.height = org_y - drag_y;
      this.bottom = org_y;
   }
   else
   {
      this.bottom = drag_y;
      this.height = drag_y - org_y;
      this.top = org_y;
   }
};


////////////////////////////////////////////////////////////
// line_intersect
//
// Calculates the points at which the line specified by the specified
// points will intersect this rectangle.  If both points lie within the
// rectangle, they will be copied in the return object.  If the line does not
// intersect, a null reference will be returned.
////////////////////////////////////////////////////////////
Rect.prototype.line_intersect = function(p1, p2)
{
   var rtn = { "p1":p1, "p2":p2 };
   if(!this.contains(p1) || !this.contains(p2))
   {
      // we need to calculate all possible intersects with this rectangle
      var intersects = [];
      if(p1.x === p2.x)
      {
         intersects.push(new Point(p1.x, this.top));
         intersects.push(new Point(p1.x, this.bottom));
      }
      else if(p1.y === p2.y)
      {
         intersects.push(new Point(this.left, p1.y));
         intersects.push(new Point(this.right, p1.y));
      }
      else
      {
         // we need to calculate the slope intercept form of the connecting line
         var m = (p1.y - p2.y) / (p1.x - p2.x);
         var b = p1.y - m*p1.x;

         // we will now apply the line equation to calculate the intercept for each side of the rectangle
         var top_intersect = new Point((this.top - b)/m, this.top);
         var bottom_intersect = new Point((this.bottom - b)/m, this.bottom);
         var left_intersect = new Point(this.left, m*this.left + b);
         var right_intersect = new Point(this.right, m*this.right + b);
         
         if(this.contains(top_intersect))
         {
            intersects.push(top_intersect);
         }
         if(this.contains(bottom_intersect))
         {
            intersects.push(bottom_intersect);
         }
         if(this.contains(left_intersect))
         {
            intersects.push(left_intersect);
         }
         if(this.contains(right_intersect))
         {
            intersects.push(right_intersect);
         }
      }

      // we will now choose the coordinates that are closest to the specified points
      if(intersects.length > 0)
      {
         var closest_distance = 1E38;
         var len = intersects.length;
         var candidate;
         var candidate_distance;
         var i;
         
         if(!this.contains(p1))
         {
            for(i = 0; i < len; ++i)
            {
               candidate = intersects[i];
               candidate_distance = Point.distance(candidate, p1);
               if(candidate_distance < closest_distance)
               {
                  rtn.p1 = candidate;
                  closest_distance = candidate_distance;
               }
            }
         }
         if(!this.contains(p2))
         {
            closest_distance = 1E38;
            for(i = 0; i < len; ++i)
            {
               candidate = intersects[i];
               candidate_distance = Point.distance(candidate, p2);
               if(candidate_distance  < closest_distance)
               {
                  rtn.p2 = candidate;
                  closest_distance = candidate_distance;
               }
            }
         }
      }
      else
      {
         rtn = null;
      }
   }
   return rtn;
};


function degreesToRadians(degrees)
{
   return degrees * Math.PI / 180;
}


function radiansToDegrees(radians)
{
   return (radians * 180) / Math.PI;
}


function getUrlVars()
{
   var vars = [], hash;
   var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
   var i;
   for(i = 0; i < hashes.length; i++)
   {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
   }
   return vars;
}

// pass a canvas context and a string
function getTextHeight(context)
{
   return context.measureText("W").width * 1.5;
//   var body = document.getElementsByTagName("body")[0];
//   var tempDiv = document.createElement("div");
//   var divText = document.createTextNode(text);
//   tempDiv.appendChild(divText);
//   tempDiv.setAttribute("style", "font-family: " + context.font.split('px ')[1] + "; font-size: " + parseInt(context.font.match(/\d+px/)) + "px");
//   body.appendChild(tempDiv);
//   var ret = tempDiv.offsetHeight;
//   body.removeChild(tempDiv);
//   return ret;
}



function measureText(context, text, textDecorations = 0)
{
   var result = context.measureText(text);
   if(!result.height) 
   {
      if (context.font !== "Arial")
      {
         let origFont = context.font;
         context.font = setFontFamily(origFont, "Arial");
         result.height = context.measureText("W").width * 1.5; //assume height("W") == width("W") * 1.5;
         context.font = origFont;
      }
      else
      {
         result.height = context.measureText("W").width * 1.5; //assume height("W") == width("W") * 1.5;
      }
   }

   if (textDecorations & 0x1)
   {
      result.height = Math.floor(result.height * 1.02 + 0.5);
   }

   return result;
}

function drawTextWithDecorations(context, textStr, textLoc_x, textLoc_y, textSize, textDecorations = 0)
{

   // use fillrect, not lineto, because of strokestyle vs. fillstyle.  color is in fillstyle.
   // offset y by baseLine.. should be either 1/2 textSize.h if context.textBaseline === midle , 
   context.fillText(textStr, textLoc_x, textLoc_y);

   if (textDecorations !== null && textDecorations !== 0)
   {
      if (textSize === null) {
         textSize = measureText(context, textStr);
         textSize.height = textSize.height * 0.65; //Necessary for the correct positioning of strikethrough and underline
      }

      var x = textLoc_x;
      var y = textLoc_y;

      if (context.textBaseline == "middle")
         y -= textSize.height / 2;
      else if (context.textBaseline == "bottom")
         y -= textSize.height;

      if (context.textAlign === "center")
         x -= textSize.width / 2;
      else if (context.textAlign === "right")
         x -= textSize.width;

      if (textDecorations & 0x1)
      {
         //context.fillRect(x, y,                   textSize.width, 2);
         //context.fillRect(x, y + textSize.height, textSize.width, 2);
         context.lineWidth = 1;
         context.fillRect(x, y + textSize.height, textSize.width, 1 + textSize.height * 0.02);
      }

      if (textDecorations & 0x2)
      {
         context.lineWidth = 1;
         context.fillRect(x, y + textSize.height/2, textSize.width, 2);
      }
   }
      
}


// Given a shorthand css font, returns a dictionary with each of
// the font property attributes
function parseCSSFont(font)
{
   var $font = $('<span />');
   $font.css('font', font);
   var fontDict = {};
   fontDict['font-style'] = $font.css('fontStyle');
   fontDict['font-variant'] = $font.css('fontVariant');
   fontDict['font-weight'] = $font.css('fontWeight');
   fontDict['font-size'] = $font.css('fontSize');
   fontDict['line-height'] = $font.css('lineHeight');
   fontDict['font-family'] = $font.css('fontFamily');
   return fontDict;
}


// Convert a dictionary containing all css font properties into a
// shorthand css font. To be used with parseCSSFont. Do not use unless
// all six properties are defined.
function expandFontDict(fontDict)
{
   if (
      fontDict['font-style'] === undefined ||
      fontDict['font-variant'] === undefined ||
      fontDict['font-weight'] === undefined ||
      fontDict['font-size'] === undefined ||
      fontDict['line-height'] === undefined ||
      fontDict['font-family'] === undefined
   )
   {
      csi_log('WARNING: Undefined values found while trying to convert ' +
         'dictionary to CSS shorthand font.');
      return '10pt Arial';
   }
   var ret = '';
   ret += fontDict['font-style'] + ' ';
   ret += fontDict['font-variant'] + ' ';
   ret += fontDict['font-weight'] + ' ';
   ret += fontDict['font-size'] + '/' + fontDict['line-height'] + ' ';
   ret += fontDict['font-family'];
   return ret;
}


// Returns the maximum font pt that will fit within the provided width and height
// Use measureVertically = true if text will be displayed vertically
function getMaxFontPt(context, font, str, width, height, margin, measureVertically = false)
{
   context.save();

   var fontDict = parseCSSFont(font);

   fontDict['font-size'] = '10pt';
   context.font = expandFontDict(fontDict);
   var dims1 = measureVertically ?
      {
         width: context.measureText('W').width,
         height: context.measureText('W').width * str.length * 1.5
      } :
      measureText(context, str);

   fontDict['font-size'] = '11pt';
   context.font = expandFontDict(fontDict);
   var dims2 = measureVertically ?
      {
         width: context.measureText('W').width,
         height: context.measureText('W').width * str.length * 1.5
      } :
      measureText(context, str);

   // dwdx is the amount the width increases when we increase the font pt by 1
   var dwdx = dims2.width - dims1.width;
   // dhdx is the amount the height increases when we increase the font pt by 1
   var dhdx = dims2.height - dims1.height;

   var widthpt = Math.floor((width - 2 * margin) / dwdx);
   var heightpt = Math.floor((height - 2 * margin) / dhdx);

   context.restore();

   return Math.max(Math.min(widthpt, heightpt), 0) + 'pt';
}


// Compare the size of two fonts; returns true if fontA < fontB
function compareFonts(context, str, fontA, fontB)
{
   context.save();
   context.font = fontA;
   var a = measureText(context, str);
   context.font = fontB;
   var b = measureText(context, str);
   context.restore();
   return a.width < b.width; // Fonts should vary only by their font-size property
}

// Returns a css font that is either the original font or a font that has been scaled
// down to fit inside the provided dimensions. Use measureVertically = true if text
// will be displayed vertically
function adjustFontForRect(context, font, str, width, height, margin = 0, measureVertically = false)
{
   var fontDict = parseCSSFont(font);
   var origSize = fontDict['font-size'];
   var maxSize = getMaxFontPt(context, font, str, width, height, margin, measureVertically);
   fontDict['font-size'] = maxSize;
   var fontSize = compareFonts(context, str, font, expandFontDict(fontDict)) ? origSize : maxSize;
   fontDict['font-size'] = fontSize;
   return expandFontDict(fontDict);
}

   // Returns a font's point size
function getFontSize(font)
{
   var fontDict = parseCSSFont(font);
   return parseInt(fontDict['font-size'], 10);
}

function setFontSize(font, size)
{
   var fontDict = parseCSSFont(font);
   fontDict['font-size'] = String(size) + "pt";
   return expandFontDict(fontDict);
}

function setFontFamily(font, name)
{
   var fontDict = parseCSSFont(font);
   fontDict['font-family'] = name;
   return expandFontDict(fontDict);
}

function getLinesAndFont(context, phrase, allowed_width, allowed_height, margin, word_wrap = true)
{
   // Break up the entire string into linefeeds using all possible line endings
   var linefeeds = phrase.split("\r\n");
   if (linefeeds.length === 1)
   {
      linefeeds = phrase.split("\r");
   }

   if (linefeeds.length === 1)
   {
      linefeeds = phrase.split("\n");
   }

   if (!word_wrap) {
      var maxLineWidth = 0;
      var minFont = context.font;
      // Iterate through all lines. Set a new minimal font when we find a line that won't fit
      for (let i = 0; i < linefeeds.length; ++i) {
         if (linefeeds[i].length != 0) {
            minFont = adjustFontForRect(context, minFont, linefeeds[i], allowed_width, allowed_height, margin);
         }
      }
      // We also shrink the font if the lines are too tall. To do this, make a string with linefeeds.length W's
      // and measure it vertically. Shrink only if needed.
      var verticalString = new Array(linefeeds.length + 1).join("W");
      minFont = adjustFontForRect(context, minFont, verticalString, allowed_width, allowed_height, margin, true);
      return { lines: linefeeds, font: minFont };
   } else {
      if (linefeeds.length === 1) {
         linefeeds = getLines(context, linefeeds, allowed_width, margin);
      }
   }

   // Create list of words
   var allWords = [];
   for (let i = 0; i < linefeeds.length; ++i)
   {
      allWords = allWords.concat(linefeeds[i].split(" "));  // word boundaries should consist of any non-letter/non-number character
   }


   // Shrink font size so that the longest word always fits within the rectangle
   for (let i = 0; i < allWords.length; ++i)
   {
      if (allWords[i].length > 0)
         context.font = adjustFontForRect(context, context.font, allWords[i], allowed_width, allowed_height, margin);
   }

   var lines = linefeeds;
   if (context.measureText("W").width * 1.5 * lines.length > allowed_height - 2 * margin) {
      // If the current text at the specified font size doesn't fit then we will
      // perform a binary search in which we repeatedly choose a font size, get the lines
      // associated with that font size, and determine if their summed height will fit within
      // the rectangle height. If they do fit, we advance the binary search pointer.
      // Otherwise, it remains stationary.
      var origFont = context.font;
      var bsPtr = 0;
      var bsIncr = 1024; // Maximal reasonable font size, must be of form 2^n
      for (; bsIncr >= 1; bsIncr /= 2) {
         var fDict = parseCSSFont(context.font);
         fDict['font-size'] = bsPtr + bsIncr + 'pt';
         context.font = expandFontDict(fDict);
         if (compareFonts(context, "W", context.font, origFont)) {
            var tempLines = getLines(context, linefeeds, allowed_width, margin);
            if (context.measureText("W").width * 1.5 * tempLines.length < allowed_height - 2 * margin) {
               bsPtr += bsIncr;
               lines = tempLines;
            }
         }
      }
   }

   return { lines: lines, font: context.font };
}


function getLines(context, linefeeds, allowed_width, margin)
{
   var rtn = [];
   var linefeed_count = linefeeds.length;
   var i, j;
   for (i = 0; i < linefeed_count; i++)
   {
      var cur_phrase = "";
      var measure = 0;
      var cur_line = linefeeds[i];
      var words = cur_line.split(" "); //Break line feeds up into words one line at a time
      var word_count = words.length;
      if (word_count > 1)
      {
         for (j = 0; j < word_count; j++)
         {
            //Add the next word onto the phrase and see if it fits
            var test_phrase = cur_phrase;
            if (test_phrase.length)
            {
               test_phrase += " ";
            }
            test_phrase += words[j];
            measure = context.measureText(test_phrase).width;
            if (measure < allowed_width - 2 * margin) //It fits
            {
               cur_phrase = test_phrase;
            }
            else //Didn't fit, so end the line we had and start a new one
            {
               rtn.push(cur_phrase);
               cur_phrase = words[j];
            }
         }

         //Add the last phrase to the rtn
         rtn.push(cur_phrase);
      }
      else //Only one word, so just push it on the rtn array
      {
         rtn.push(words[0]);
      }
   }
   return rtn;
}



function scaleContextForEllipse(context, rect)
{
   if(rect.width > rect.height)
   {
      context.scale(rect.width / rect.height, 1);
   }
   else
   {
      context.scale(1, rect.height / rect.width);
   }
}


function draw_circle(context, rect)
{
   var radius = Math.min(rect.width / 2, rect.height / 2);
   context.beginPath();
   context.arc(0, 0, radius, 0, 2 * Math.PI, false);
}


function draw_ellipse(context, rect)
{
   context.save();
   context.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);
   scaleContextForEllipse(context, rect);
   draw_circle(context, rect);
   context.restore();
}


function drawDashedLine(context, x_, y_, x2_, y2_, dashArray, previous)
{
   // we will assign our own coordinates based on the parameters.  The
   // dashing algorithm also assumes that x increases from x to x2.
   // In order to accomodate this, we may have to reverse the points.
   var x, y, x2, y2;
   if(x2_ > x_)
   {
      x = Number(x_);
      y = Number(y_);
      x2 = Number(x2_);
      y2 = Number(y2_);
   }
   else
   {
      x = Number(x2_);
      y = Number(y2_);
      x2 = Number(x_);
      y2 = Number(y_);
   }

   // we can now draw the dashes
   var dashCount = dashArray.length;
   context.moveTo(x, y);
   var dx = (x2 - x);
   var dy = (y2 - y);
   var slope = dy / dx;
   var distRemaining = Math.sqrt(dx * dx + dy * dy);
   var dashIndex = 0;
   var draw = true;

   if(slope === Infinity)
   {
      slope = 1E38;
   }
   else if(slope === -Infinity)
   {
      slope = -1E38;
   }

   if(!previous || previous.length === 0) 
   {
      previous = [0, 0];
   }
   dashIndex = previous[1];
   while(distRemaining >= 0.1)
   {
      draw = dashIndex % 2 === 0;
      var dashLength;

      if(previous[0] === 0)
      {
         dashLength = dashArray[dashIndex % dashCount];
         if(!draw)
         {
            dashLength += context.lineWidth;
         }
      }
      else
      {
         dashLength = previous[0];
      }

      if(dashLength > distRemaining)
      {
         previous[0] = dashLength - distRemaining;
         dashLength = distRemaining;
      }
      else
      {
         ++dashIndex;
         previous[0] = 0;
      }
      var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
      x += xStep;
      y += slope * xStep;

      context[draw ? 'lineTo' : 'moveTo'](x, y);
      distRemaining -= dashLength;
   }
   previous[1] = dashIndex;
}

function getGradient(context, rect, mode, color1, colorMid, color2, bUseMid) 
{
   var x0, y0, x1, y1;
   var r0, r1;
   switch(mode)
   {
      case Enum.GRADIENT.LinearGradientModeHorizontal:
         x0 = rect.left;
         x1 = rect.left + rect.width;
         y0 = y1 = 0;
         break;
      case Enum.GRADIENT.LinearGradientModeVertical:
         y0 = rect.top;
         y1 = rect.top + rect.height;
         x0 = x1 = 0;
         break;
      case Enum.GRADIENT.LinearGradientModeForwardDiagonal:
         x0 = rect.left;
         y0 = rect.top;
         x1 = rect.left + rect.width;
         y1 = rect.top + rect.height;
         break;
      case Enum.GRADIENT.LinearGradientModeBackwardDiagonal:
         x0 = rect.left + rect.width;
         y0 = rect.top + rect.height;
         x1 = rect.left;
         y1 = rect.top;
         break;
      case Enum.GRADIENT.Radial:
         x0 = rect.left + rect.width / 2;
         y0 = rect.top  + rect.height / 2;
         r0 = 0;
         r1 = rect.width / 2;
   }

   var gradient = mode == Enum.GRADIENT.Radial ?
      context.createRadialGradient(x0, y0, r0, x0, y0, r1) :
      context.createLinearGradient(x0, y0, x1, y1);

   gradient.addColorStop(0, color1);
   if (bUseMid) gradient.addColorStop(0.5, colorMid);
   gradient.addColorStop(1, color2);

   return gradient;
}



//Enum
var Enum = {}; //Global Enum Array
Enum.BUTTON =
{
   LEFT: 0,
   MIDDLE: 1,
   RIGHT: 2
};
Enum.LOGICAL_OPERAND =
   {
      NONE: 0,
      AND: 1,
      OR: 2
   };
Enum.COMPARATOR =
{
   GREATER_THAN: 0,
   LESS_THAN: 1,
   GREATER_THAN_EQUAL: 2,
   LESS_THAN_EQUAL: 3,
   EQUAL: 4,
   NOT_EQUAL: 5
};


//component enumerations
Enum.BORDER_STYLE =
{
   NONE: 0,
   RAISED: 1,
   LOWERED: 2,
   SINGLE: 3,
   RAISED_BEVEL: 4,
   LOWERED_BEVEL: 5
};

Enum.BACKGROUND_STYLE =
{
   USE_SOLID_COLOR: 0,
   USE_GRADIENT:    1,
   USE_TRANSPARENT: 2
};

Enum.GRADIENT = 
{
   LinearGradientModeHorizontal        : 0,
   LinearGradientModeVertical          : 1,
   LinearGradientModeForwardDiagonal   : 2,
   LinearGradientModeBackwardDiagonal  : 3,
   Radial                              : 4
};

Enum.ORIENTATION =
{
   BOTTOM_TO_TOP: 0,
   TOP_TO_BOTTOM: 1,
   LEFT_TO_RIGHT: 2,
   RIGHT_TO_LEFT: 3
};
Enum.ALIGNMENT =
{
   LEFT: 0,
   CENTER: 1,
   RIGHT: 2
};

Enum.LINE_TYPE =
{
   SOLID: 0,
   DASH: 1,
   DOT: 2,
   DASHDOT: 3,
   DASHDOTDOT: 4,
   CLEAR: 5,
   IGNORE: 6,
   SMALLDOTS: 7
};



////////////////////////////////////////////////////////////
// Csi namespace
//
// Provides namespace on which to hang various functions
////////////////////////////////////////////////////////////
function Csi()
{ }


/**
 * @return Returns an array where each element is a character from the string.
 *
 * @param s Specifies the string to split.
 */
Csi.string_to_array = function(s)
{ return s.split(""); };


Csi.dash_pattern = [17, 5];
Csi.small_dot_pattern = [2, 2];
Csi.dot_pattern = [3, 3];
Csi.dash_dot_pattern = [8, 5, 2, 5];
Csi.dash_dot_dot_pattern = [8, 2, 2, 2, 2, 2];


Csi.draw_line = function (context, x1_, y1_, x2_, y2_, style)
{
   var x1 = Math.floor(x1_) + 0.5;
   var y1 = Math.floor(y1_) + 0.5;
   var x2 = Math.floor(x2_) + 0.5;
   var y2 = Math.floor(y2_) + 0.5;

   var pattern = null;
   context.beginPath();
   switch(style)
   {
      case Enum.LINE_TYPE.SOLID:
         pattern = null;
         context.moveTo(x1, y1);
         context.lineTo(x2, y2);
         break;

      case Enum.LINE_TYPE.DASH:
         pattern = Csi.dash_pattern;
         break;

      case Enum.LINE_TYPE.DOT:
         pattern = Csi.dot_pattern;
         break;

      case Enum.LINE_TYPE.DASHDOT:
         pattern = Csi.dash_dot_pattern;
         break;

      case Enum.LINE_TYPE.DASHDOTDOT:
         pattern = Csi.dash_dot_dot_pattern;
         break;

      case Enum.LINE_TYPE.CLEAR:
      case Enum.LINE_TYPE.IGNORE:
         pattern = null;
         break;

      //case Enum.LINE_TYPE.SMALLDOTS: 
      default:
         pattern = Csi.small_dot_pattern;
         context.lineWidth = 1;
         break;
   }
   if(pattern) 
   {
      drawDashedLine(context, x1, y1, x2, y2, pattern, [0, 0]);
   }
   context.stroke();
};


/**
 * Performs a binary search on the provided array for a match to the provided value.
 * Assumes that the provided array has already been sorted.
 *
 * @return Returns the index of the value if it was found or -1 if it was not found.
 *
 * @oaram {array} values Specifies the array in which the search fill take place.
 *
 * @param {any} value Specifies the value to search for.
 *
 * @param {number} start_ Specifies the starting position in the array for the search.
 * If specified as null, this value will default to zero.
 *
 * @param {number} end_ Specifies the ending position in the array for the search.
 * If specified as null, this value will default to the index of the last element.
 *
 * @param {function} comparator Specifies a function that will compare an array value with
 * the provided value.  This function expects two arguments that specify the value to be
 * compared and is expected to return an integer that is negative if the first value
 * orders before the second, 0 if the values order the same, and a positive number if the second
 * orders after the first value.
 */
Csi.binary_search = function(values, value, start_, end_, comparator)
{
   var start, middle, end, candidate;
   var rtn = -1;
   var result;
   
   if(start === null || start === undefined)
      start = 0;
   if(end === null || end === undefined)
      end = values.length - 1;
   if(comparator === null || comparator === undefined)
   {
      comparator = function(v1, v2) {
         if(v1 < v2)
            return -1;
         else if(v1 > v2)
            return 1;
         else
            return 0;
      };
   }
   while(start < end && rtn === -1)
   {
      middle = Math.floor(start + (end - start) / 2);
      candidate = values[middle];
      result = comparator(value, candidate);
      if(result > 0)
      {
         if(start !== middle)
            start = middle;
         else
            break;
      }
      else if(result < 0)
      {
         if(end !== middle)
            end = middle;
         else
            break;
      }
      else
         rtn = middle;
   }
   return rtn;
};

/* $HeadURL: svn://engsoft/rtmc-5.0/coratools/javascript/CsiOneShotTimer.js $

Copyright (C) 2010 Campbell Scientific, Inc.
Started On: 8/1/2010
Started By: Kevin Westwood

$LastChangedBy: tmecham $
$LastChangedDate: 2013-02-20 08:35:21 -0700 (Wed, 20 Feb 2013) $
$LastChangedRevision: 17302 $
*/

var oneShotTimer = new CsiOneShotTimer(); //GLOBAL DECLARATION

function CsiOneShotTimer()
{
   this.timeoutID = -1;
   this.listeners = [];
   this.nextFireTime = Number.MAX_VALUE;
}


CsiOneShotTimer.prototype.setTimeout = function (listener, tag, interval)
{
   if(listener.onOneShotTimer)
   {
      var listenerHolder = new OneShotListenerHolder(listener, tag, interval);
      this.listeners.push(listenerHolder);
      if(listenerHolder.nextFireTime < this.nextFireTime)
      {
         this.stopTimer();
         this.startTimer();
      }
   }
   else
   {
      csi_log("onOneShotTimer not defined for " + listener);
   }
};


CsiOneShotTimer.prototype.clearTimeout = function(listener, tag)
{
   var listenerHolder = this.removeListener(listener, tag);
   if(listenerHolder && (listenerHolder.nextFireTime === this.nextFireTime))
   {
      this.stopTimer();
      this.startTimer();
   }
};


CsiOneShotTimer.prototype.removeListener = function(listener, tag)
{
   var i;
   var len = this.listeners.length;
   for(i = 0; i < len; i++)
   {
      var listenerHolder = this.listeners[i];
      if((listenerHolder.listener === listener) && (listenerHolder.tag === tag))
      {
         return this.listeners.splice(i, 1);
      }
   }

   return null; //not found
};


CsiOneShotTimer.prototype.stopTimer = function()
{
   //clear previous timeout
   if(this.timeoutID > -1) //timer active
   {
      clearTimeout(this.timeoutID);
      this.nextFireTime = Number.MAX_VALUE;
      this.timeoutID = -1;
   }
};


function CsiOnTimer()
{
   oneShotTimer.onTimer();
}


CsiOneShotTimer.prototype.startTimer = function()
{
   if((this.timeoutID < 0) && //not already started
       (this.listeners.length > 0)) //there are listeners
   {
      this.nextFireTime = this.listeners[0].nextFireTime;
      var currentTime = Date.now();

      var i;
      var len = this.listeners.length;
      for(i = 0; i < len; i++)
      {
         var listenerHolder = this.listeners[i];

         //nextPollTime is the earliest time that another poll should occur.
         this.nextFireTime = Math.min(this.nextFireTime, listenerHolder.nextFireTime);
      }

      //calculate the next timeout Interval
      var interval = this.nextFireTime - currentTime;
      interval = Math.max(interval, 50); //don't allow negative interval
      this.timeoutID = setTimeout(CsiOnTimer, interval);
   }
};


CsiOneShotTimer.prototype.onTimer = function ()
{
   this.timeoutID = -1;
   this.nextFireTime = Number.MAX_VALUE;

   var currentTime = Date.now();
   var listenerHolder;
   var i = this.listeners.length - 1;
   while(i >= 0)
   {
      listenerHolder = this.listeners[i];
      if(currentTime >= listenerHolder.nextFireTime)
      {
         this.listeners.splice(i, 1); //remove before calling event.
         listenerHolder.listener.onOneShotTimer(listenerHolder.tag);
      }
      i--;
   }

   this.startTimer();
};


function OneShotListenerHolder(listener, tag, interval)
{
   this.listener = listener;
   this.tag = tag;
   this.nextFireTime = Date.now() + interval;
}
/* CsiClockChecker.js

   Copyright (C) 2010 Campbell Scientific, 2020 Campbell Scientific, Inc.
   
*/

function CsiClockChecker(uri)
{
   if(uri)
      this.uri = uri;
   else
      this.uri = '';

   this.state = Enum.CheckClockState.none;
   this.ownerComponent = null;
   /* The ownerComponent class should implement the following */
   //class.prototype.on_check_clock_success = function(new_time_estimate)
   //class.prototype.on_check_clock_failure = function()
    
   this.refresh_interval = 60; //Seconds to re-synch ourselves with the actual time source
   this.last_clock_checked_at = null; //the local time when we last successfully checked the clock
   this.last_clock_checked_time = null; //the actual timestamp we got from the last clock check
}


CsiClockChecker.prototype.needs_clock_check = function()
{
   var needs_clock_check = false;

   if(this.state !== Enum.CheckClockState.currentlyChecking)
   {
      if(this.last_clock_checked_at && this.last_clock_checked_time)
      {
         //How much time has ellapsed since our last successful clock check
         var ellapsed_time = CsiLgrDate.local().milliSecs - this.last_clock_checked_at.milliSecs;
         if(ellapsed_time > this.refresh_interval * CsiLgrDate.msecPerSec)
         {
            needs_clock_check = true;
         }
      }
      else
      {
         //We haven't done a clock sync yet
         needs_clock_check = true;
      }
   }

   if(needs_clock_check)
   {
      //Trigger an actual clock check to we have a closer estimate
      this.do_clock_check();
   }

   return needs_clock_check;
};


CsiClockChecker.prototype.getClockEstimate = function()
{
   let ellapsed_time = 0;
   if(this.last_clock_checked_at)
   {
      //How much time has ellapsed since our last successful clock check
      ellapsed_time = CsiLgrDate.local().milliSecs - this.last_clock_checked_at.milliSecs;
   }

   //send the time estimated based on the last actual timestamp + the ellapsed time
   let new_estimate = new CsiLgrDate.local();
   if(this.last_clock_checked_time)
   {
      new_estimate = new CsiLgrDate(this.last_clock_checked_time.milliSecs + ellapsed_time);
   }
   return new_estimate;
};


CsiClockChecker.prototype.checkClock = function()
{
   if(this.needs_clock_check()) 
   {
      //Wait for the asynch clock check to notify the client when the check is complete
   }
   else
   {
      if(this.ownerComponent.on_check_clock_success)
      {
         let new_estimate = this.getClockEstimate();
         this.ownerComponent.on_check_clock_success(new_estimate);
      }
   }
};


CsiClockChecker.prototype.do_clock_check = function()
{
   if(!this.ownerComponent)
      return;

   if(this.state === Enum.CheckClockState.success || this.state === Enum.CheckClockState.fail)
   {
      oneShotTimer.clearTimeout(this, null); //cancel 5 second timeout to signal a finish on a set
   }

   //Don't check again if we are currently checking
   if(this.state !== Enum.CheckClockState.currentlyChecking)
   {
      this.state = Enum.CheckClockState.currentlyChecking;
      var checker = this;
      $.ajax
         ({
            url: ".?command=ClockCheck&format=json" + ((checker.uri && checker.uri.length > 0) ? ("&uri=" + encodeURIComponent(checker.uri)) : ""),
            dataType: 'json',
            cache: false,
            timeout: 60000,
            beforeSend: function(xhr)
            {
               checker.before_check_attempt(xhr);
            },
            success: function(json, status, xhr)
            {
               checker.check_attempt_success(json, status, xhr);
            },
            error: function(xhr, status, error)
            {
               checker.check_attempt_error(xhr, status, error);
            }
         });
   }
};


CsiClockChecker.prototype.before_check_attempt = function(xhr)
{
   this.state = Enum.CheckClockState.currentlyChecking;
};


CsiClockChecker.prototype.check_attempt_success = function(json, status, xhr)
{
   if(json)
   {
      if(json.outcome === 1)
      {
         this.last_clock_checked_at = new CsiLgrDate.local();
         this.last_clock_checked_time = CsiLgrDate.fromStr(json.time);
         this.state = Enum.CheckClockState.success;
         if(this.ownerComponent.on_check_clock_success)
            this.ownerComponent.on_check_clock_success(this.last_clock_checked_time);
      }
      else
         this.state = Enum.CheckClockState.fail;
   }
   else //json is null so error
      this.state = Enum.CheckClockState.fail;

   if(this.state === Enum.CheckClockState.fail)
   {
      this.last_clock_checked_at = null;
      this.last_clock_checked_time = null;
      if(this.ownerComponent.on_check_clock_failure)
         this.ownerComponent.on_check_clock_failure();
   }
};


CsiClockChecker.prototype.check_attempt_error = function(xhr, status, error)
{
   this.last_clock_checked_at = null;
   this.last_clock_checked_time = null;
   this.state = Enum.CheckClockState.fail;
   this.ownerComponent.invalidate();
   if(this.ownerComponent.on_check_clock_failure)
      this.ownerComponent.on_check_clock_failure();
};


Enum.CheckClockState =
   {
      none: 0,
      currentlyChecking: 1,
      success: 2,
      fail: 3
   };


Enum.TIME_SOURCE =
   {
      Server_Time_On_Last_Data_Collection_From_Station: 0, //expression contains "__statistics__.<loggername>.Last Data Collection"
      Station_Time: 1, //expression contains "__statistics__.<loggername>.Last Clock Check", (can be updated if a clock schedule is set up)
      Data_Time_In_Last_Record_From_Table: 2, //time component added to web query
      Current_Server_Time: 3,
      PC_Time: 4, //time taken from browser
      Time_Value: 5 //expression contains timestamp variable
   };

/* CsiSourceTimeVariable.js
 *
 * Copyright (C) 2020, 2020 Campbell Scientific, Inc.
 *
 */

/* global CsiClockChecker: true */

/*
 * class CsiSourceTimeVariable
 */
function CsiSourceTimeVariable(source_name)
{
   this.source_name = source_name;
   //We will assume the timestamp and value are all the timestamp
   this.timestamp = null;
   this.type = "xsd:dateTime";
   this.synch_interval = 300000; //Resynch every 5 minutes

   //Use the clock check to send the request for the source time
   this.clockChecker = new CsiClockChecker(this.source_name);
   this.clockChecker.ownerComponent = this;

   //Force a clock check and then arm the oneshot for 5 minutes
   this.clockChecker.do_clock_check();
   oneShotTimer.setTimeout(this, null, this.synch_interval);

   this.ownerComponent = null;
}


CsiSourceTimeVariable.prototype.onOneShotTimer = function(tag)
{
   this.clockChecker.needs_clock_check();
   this.timestamp = this.clockChecker.getClockEstimate();
   oneShotTimer.setTimeout(this, null, this.synch_interval);
};

CsiSourceTimeVariable.prototype.get_value = function()
{
   this.timestamp = this.clockChecker.getClockEstimate();
   return this.timestamp;
};


CsiSourceTimeVariable.prototype.evaluate = function (stack)
{
   let timestamp = this.get_value();
   stack.push(new CsiOperand(timestamp, timestamp));
};


CsiSourceTimeVariable.prototype.set_value = function (value, timestamp)
{
   this.timestamp = value;
};


CsiSourceTimeVariable.prototype.on_check_clock_success = function(new_time_estimate)
{
   this.timestamp = new_time_estimate;
   if(this.ownerComponent && this.ownerComponent.setLgrDate)
   {
      this.ownerComponent.setLgrDate(this.timestamp);
   }
};


CsiSourceTimeVariable.prototype.on_check_clock_failure = function()
{
   this.timestamp = null;
};

/* CsiExpression.js

   Copyright (C) 2010, 2018 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Tuesday 27 July 2010
   Last Change: Friday 21 December 2018
   Last Commit: $Date: 2019-07-29 15:37:53 -0600 (Mon, 29 Jul 2019) $
   Last Changed by: $Author: jon $

*/

/**
 * Defines an object that can evaluate a CRBasic type expression.
 *
 * @param {array | string} tokens If passed as an array, sets the postfix stack of operations
 * that will be evaluated.  If specified as a string, specifies the expression in infix
 * form that needs to be parsed and converted.
 */
function CsiExpression(tokens)
{
   var expression = this;
   this.tokens = tokens;
   this.ownerComponent = null; //set when added to component
   this.has_table_ref = false;
   this.variables = null;
   this.tokens.forEach(function(token) {
      if(token && typeof token.set_owner_expression === "function")
      {
         token.set_owner_expression(expression);
         if(!expression.has_table_ref && token.hasOwnProperty("is_table"))
            expression.has_table_ref = token.is_table;
      }
   });
}


/**
 * @return {token} Evaluates the postfix expression and returns the final token.
 */
CsiExpression.prototype.evaluate = function()
{
   var data_stack = [];
   var expression = this;
   this.tokens.forEach(function(token) {
      token.evaluate(data_stack, expression.tokens);
   });
   return data_stack[0];
};


/**
 * Invokes reset on all tokens that support it.
 */
CsiExpression.prototype.reset = function()
{
   this.tokens.forEach(function(token) {
      if(token && typeof token.reset === "function")
         token.reset();
   });
};


/**
 * Lexically breaks down a source expression string into a collection of tokens.  This is the first stage of
 * converting an expression string into a postfix expression.
 *
 * @return {array} Generates an array of objects that represent the significant
 * tokens in the specified expression string along with their starting position
 * in the source and their length.
 *
 * @param {string} source_ Specifies the source string in infix notation.
 */
CsiExpression.make_string_tokens = function(source_)
{
   var is_operator = function(token) {
      var rtn = false;
      switch(token)
      {
      case '+':
      case '-':
      case '*':
      case '/':
      case '(':
      case ')':
      case '^':
      case ',':
      case '=':
      case '<':
      case '>':
      case ';':
         rtn = true;
         break;
      }
      return rtn;
   };
   var is_space = function(ch) { return /\s/.test(ch); };
   const state_between_tokens = 1;
   const state_in_name = 2;
   const state_quoted = 3;
   const state_after_number = 4;
   const state_after_decimal = 5;
   const state_after_exp = 6;
   const state_after_exp_sign = 7;
   const state_after_amp = 8;
   const state_after_amp_hex = 9;
   const state_after_amp_bin = 10;
   const state_after_lt = 11;
   const state_after_gt = 12;
   const state_after_dollar = 13;
   const state_in_string = 14;
   var state = state_between_tokens;
   var i;
   var source = source_.split("");
   var ch;
   var cur_word = "";
   var rtn = [];
   
   for(i = 0; i < source.length; ++i)
   {
      ch = source[i];
      if(state === state_between_tokens)
      {
         if(ch >= '0' && ch <= '9')
         {
            cur_word += ch;
            state = state_after_number;
         }
         else if(ch === '.')
         {
            cur_word += ch;
            state = state_after_decimal;
         }
         else if(ch === '&')
         {
            cur_word += ch;
            state = state_after_amp;
         }
         else if(ch === '>')
         {
            cur_word += ch;
            state = state_after_gt;
         }
         else if(ch === '<')
         {
            cur_word += ch;
            state = state_after_lt;
         }
         else if(is_operator(ch))
         {
            if(cur_word.length)
               rtn.push({ token: cur_word, start: i - cur_word.length });
            rtn.push({ token: ch, start: i });
            cur_word = "";
         }
         else if(ch === '\"')
         {
            cur_word += ch;
            state = state_quoted;
         }
         else if(ch === '$')
         {
            if(cur_word.length)
               rtn.push({ token: cur_word, start: i - cur_word.length });
            cur_word = ch;
            state = state_after_dollar;
         }
         else if(!is_space(ch))
         {
            cur_word += ch;
            state = state_in_name;
         }
      }
      else if(state === state_in_name)
      {
         if(is_space(ch) || is_operator(ch))
         {
            rtn.push({ token: cur_word, start: i - cur_word.length });
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else if(ch === '\"')
         {
            cur_word += ch;
            state = state_quoted;
         }
         else
            cur_word += ch;
      }
      else if(state === state_quoted)
      {
         if(ch === '\"')
         {
            if(cur_word.length)
            {
               cur_word.append(ch);
               state = state_in_name;
            }
            else
               state = state_between_tokens;
         }
         else
            cur_word += ch;
      }
      else if(state === state_after_number)
      {
         if(ch >= '0' && ch <= '9')
            cur_word += ch;
         else if(ch === '.')
         {
            cur_word += ch;
            state = state_after_decimal;
         }
         else if(ch === 'e' || ch === 'E')
         {
            cur_word += ch;
            state = state_after_exp;
         }
         else if(is_operator(ch) || is_space(ch))
         {
            rtn.push({ token: cur_word, start: i - cur_word.length });
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else
            throw { message: "unexpected character in number constant", pos: i };
      }
      else if(state === state_after_decimal)
      {
         if(ch >= '0' && ch <= '9')
            cur_word += ch;
         else if(ch === 'e' || ch === 'E')
         {
            cur_word += ch;
            state = state_after_exp;
         }
         else if(is_operator(ch) || is_space(ch))
         {
            rtn.push({ token: cur_word, start: i - cur_word.length });
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else
            throw { message: "unexpected character in number constant", pos: i };
      }
      else if(state === state_after_exp)
      {
         if(ch === '+' || ch === '-' || (ch >= '0' && ch <= '9'))
         {
            cur_word += ch;
            state = state_after_exp_sign;
         }
         else
            throw { message: "unexpected character in number constant", pos: i };
      }
      else if(state === state_after_exp_sign)
      {
         if(ch >= '0' && ch <= '9')
            cur_word += ch;
         else if(is_space(ch) || is_operator(ch))
         {
            rtn.push({token: cur_word, start: i - cur_word.length });
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else
            throw { message: "unexpected character in number constant", pos: i};
      }
      else if(state === state_after_amp)
      {
         if(ch === 'h' || ch === 'H')
         {
            cur_word += ch;
            state = state_after_amp_hex;
         }
         else if(ch === 'b' || ch === 'B')
         {
            cur_word += ch;
            state = state_after_amp_bin;
         }
         else
            throw { message: "invalid ampersand constant", pos: i };
      }
      else if(state === state_after_amp_hex)
      {
         if((ch >= '0' && ch <= '9') ||
            (ch >= 'a' && ch <= 'f') ||
            (ch >= 'A' && ch <= 'F'))
            cur_word += ch;
         else if(is_space(ch) || is_operator(ch))
         {
            rtn.push({ token: cur_word, start: i - cur_word.length });
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else
            throw { message: "invalid hexadecimal constant", pos: i };
      }
      else if(state === state_after_amp_bin)
      {
         if(ch === '0' || ch === '1')
            cur_word += ch;
         else if(is_space(ch) || is_operator(ch))
         {
            rtn.push({token: cur_word, start: i - cur_word.length});
            cur_word = "";
            if(!is_space(ch))
               --i;
            state = state_between_tokens;
         }
         else
            throw {message: "invalid binary constant", pos: i};
      }
      else if(state === state_after_lt)
      {
         if(ch === '>' || ch === '=')
            cur_word += ch;
         else
            --i;
         rtn.push({token: cur_word, start: i - cur_word.length});
         state = state_between_tokens;
      }
      else if(state === state_after_gt)
      {
         if(ch === '=')
            cur_word += ch;
         else
            --i;
         cur_word = "";
         state = state_between_tokens;
      }
      else if(state === state_after_dollar)
      {
         if(ch === '\"')
         {
            cur_word += ch;
            state = state_in_string;
         }
         else
            throw {message: "double quotes expected after an unquoted dollar sign", pos: i};
      }
      else if(state === state_in_string)
      {
         cur_word += ch;
         if(ch === '\"')
         {
            rtn.push({token: cur_word, start: i - cur_word.length});
            cur_word = "";
            state = state_between_tokens;
         }
      }
   }
   if(cur_word.length > 0)
      rtn.push({token: cur_word, start: i - cur_word.length});
   if(state === state_quoted)
      throw {message: "unbalanced quotes in expression", pos: i};
   return rtn;
};


/**
 * Implements the second stage of the expressions parser.  This stage will convert the specified
 * array of string tokens into expression token objects.
 *
 * @param {array} string_tokens Specifies the collection of string tokens.  This array is generated
 * by calling CsiExpression.make_string_tokens.
 *
 * @return {object} Returns an object that contains two array properties: tokens and variables.
 */
CsiExpression.make_tokens = function(string_tokens)
{
   var rtn = { tokens: [], variables: {} };
   var prev_token = null;
   string_tokens.forEach(function(string_token) {
      var current_token;
      var token_name = string_token.token.toUpperCase();
      
      if(rtn.variables.hasOwnProperty(token_name))
      {
         current_token = rtn.variables[token_name];
         rtn.tokens.push({token: current_token, start: string_token.start});
      }
      else
      {
         current_token = CsiExprToken.make_token(prev_token, token_name);
         if(current_token)
         {
            if(current_token.is_variable())
               rtn.variables[token_name] = current_token;
            rtn.tokens.push({token: current_token, start: string_token.start});
         }
         else
            throw {message: "unrecognised token name", pos: string_token.pos};
         prev_token = current_token;
      }
   });
   return rtn;
};


/**
 * Implements the third stage of parsing an expression string.  This method will
 * converts an infix collection of tokens and converts it to a postfix collection.
 *
 * @param {object} tokens Specifies an object that has a property that specifies the
 * collection of parsed tokens and another property that specifies the variables
 * in the expression.
 *
 * @return {object} Returns an object that has properties that specify the postfix
 * operations stack and the variables in the expression.
 */
CsiExpression.infix_to_postfix = function(tokens)
{
   var op_stack = [];
   var rtn = { tokens: [], variables: tokens.variables };
   var popped_token;
   tokens.tokens.forEach(function(current) {
      var paren_token;
      var cont;
      
      if(current.token.is_comma())
      {
         if(op_stack.length > 0)
         {
            // we need to pop off everything off the op stack that has lesser priority
            // then the current token.
            popped_token = op_stack[op_stack.length - 1];
            while(op_stack.length > 0 &&
                  popped_token.token.get_priority() < current.token.get_priority() &&
                  !popped_token.token.is_lparen())
            {
               op_stack.pop();
               rtn.tokens.push(popped_token.token);
               if(op_stack.length > 0)
                  popped_token = op_stack[op_stack.length - 1];
            }
            if(!popped_token.token.is_lparen())
               throw { message: "comma must appear within parentheses", pos: popped_token.start };

            // we need to increment the argument count, if any, of the token in the front of the
            // left parenthese.
            paren_token = popped_token;
            op_stack.pop();
            if(op_stack.length > 0)
            {
               popped_token = op_stack[op_stack.length - 1];
               popped_token.token.increment_args_count();
            }
         }
      }
      else if(current.token.is_rparen())
      {
         if(op_stack.length > 0)
         {
            // we need to pop ops from the stack until we find the matching left parenthese.
            popped_token = op_stack[op_stack.length - 1];
            while(op_stack.length > 0 && !popped_token.token.is_lparen())
            {
               op_stack.pop();
               rtn.tokens.push(popped_token.token);
               if(op_stack.length > 0)
                  popped_token = op_stack[op_stack.length - 1];
            }
            if(!popped_token.token.is_lparen())
               throw {message: "Mismatched parentheses", pos: popped_token.start};
            else
               op_stack.pop();
         }
      }
      else if(current.token.is_lparen())
      {
         // always push left parens on the op stack.
         if(op_stack.length > 0)
            op_stack[op_stack.length - 1].token.clear_args_count();
         op_stack.push(current);
      }
      else if(current.token.is_operator())
      {
         if(op_stack.length === 0)
            op_stack.push(current);
         else
         {
            cont = true;
            while(cont)
            {
               if(op_stack.length === 0)
                  cont = false;
               else
               {
                  popped_token = op_stack[op_stack.length - 1];
                  if(popped_token.token.is_lparen() ||
                     popped_token.token.get_priority() < current.token.get_priority())
                  {
                     cont = false;
                  }
                  else if(popped_token.token.get_priority() === current.token.get_priority() &&
                     current.token.get_priority() >= CsiExprToken.prec_max_operator)
                  {
                     cont = false;
                  }
               }
               if(cont)
               {
                  popped_token = op_stack.pop();
                  rtn.tokens.push(popped_token.token);
               }
            }
            op_stack.push(current);
         }
      }
      else if(current.token.is_semi_colon())
      {
         while(op_stack.length > 0)
         {
            popped_token = op_stack.pop();
            if(!popped_token.token.is_lparen())
               rtn.tokens.push(popped_token.token);
         }
      }
      else // we assume an operand
         rtn.tokens.push(current.token);
   });

   // we have finished going through the original stack.  We need to pop off any remaining
   // operators on the op stack
   while(op_stack.length > 0)
   {
      popped_token = op_stack.pop();
      if(popped_token.token.is_lparen() || popped_token.token.is_rparen())
         throw {message: "mismatched parentheses", pos: popped_token.start};
      rtn.tokens.push(popped_token.token);
   }
   return rtn;
};   


/**
 * @return Returns an expression object that has been parsed from a string source.
 *
 * @param {string} source Specifies the source for the string.
 */
CsiExpression.parse = function(source)
{
   var string_tokens = CsiExpression.make_string_tokens(source);
   var tokens = CsiExpression.make_tokens(string_tokens);
   var postfix = CsiExpression.infix_to_postfix(tokens);
   var rtn = new CsiExpression(postfix.tokens);
   rtn.variables = postfix.variables;
   return rtn;
};

/* CsiWebQuery.js

   Copyright (C) 2010, 2016 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Monday 02 August 2010
   Last Change: Friday 22 April 2016
   Last Commit: $Date: 2020-02-14 14:31:16 -0700 (Fri, 14 Feb 2020) $
   Last Changed by: $Author: tmecham $

*/


function ExcSynchValues()
{ }


////////////////////////////////////////////////////////////
// class CsiWebQuery
//
// Defines an object that represents a data request to the web server
////////////////////////////////////////////////////////////
function CsiWebQuery(
   uri,
   mode,
   p1,
   p2,
   order,
   requestInterval,
   override_interval,
   variables,
   js_name,
   report_offset)
{
   this.uri = uri;
   this.mode = mode;
   this.p1 = p1;
   this.p2 = p2;
   this.order = order;
   this.tableDefSignature = 0;
   this.requestInterval = requestInterval; //how often should this query occur
   this.override_interval = override_interval;
   this.variables = variables; //Variables that should be updated when data comes in
   this.last_record_no = -1;
   this.last_stamp = new CsiLgrDate();
   this.js_name = js_name;
   this.report_offset = report_offset;
   var i;

   //keep list of expressions that are affected by this webQuery
   this.expressions = [];
   var len = variables.length;
   for (i = 0; i < len; i++)
   {
      //todo: This check for ownerExpression can be removed once the RTMC project is generated automatically
      if (variables[i].ownerExpression)
      {
         if($.inArray(variables[i].ownerExpression, this.expressions) === -1)
         {
            this.expressions.push(variables[i].ownerExpression);
         }
      }
   }
   this.loadingData = false;  //actively loading data?
   this.nextQueryTime = 0; //next time to request data

   this.query_satisfied = false; //date-range queries should only poll once
   this.supervisor = null;
   this.websock_transaction = null; // this query has no associated websocket request.
}


//returns the command for the HTTPRequest
CsiWebQuery.prototype.getCommand = function ()
{
   if(this.supervisor && this.supervisor.on_query_begin)
   {
      this.supervisor.on_query_begin(this);
   }

   var rtn = ".?command=DataQuery" +
         "&uri=" + encodeURIComponent(this.uri) +
         "&format=json" +
         "&mode=" + this.mode +
         "&p1=" + this.p1 +
         "&p2=" + this.p2 +
         "&headsig=" + this.tableDefSignature +
         "&nextpoll=" + this.requestInterval;
   if(this.order.length > 0)
   {
      rtn = rtn + "&order=" + this.order;
   }

   if(this.override_interval >= 0)
   {
      rtn = rtn + "&refresh=" + this.override_interval;
   }
   return rtn;
};


/**
 * @return Returns an object that represents a request for the data for this query.
 */
CsiWebQuery.prototype.get_websock_request = function(transaction)
{
   var rtn = {
      uri: this.uri,
      mode: this.mode,
      p1: this.p1,
      p2: this.p2,
      transaction: transaction
   };
   if(this.override_interval >= 0)
      rtn.refresh = this.override_interval;
   if(this.order.length > 0)
      rtn.order = this.order;
   this.websock_transaction = transaction;
   return rtn;
};


/**
 * Called when a complete header has been received from the server.
 *
 * @param header  Specifies the CSIJson header structure.
 *
 * @param do_reset Set to true if the state of expressions and components should be reset.
 */
CsiWebQuery.prototype.process_header = function(head, do_reset)
{
   //cache tableDefSignature for future Queries
   this.tableDefSignature = head.signature;
   
   //cache field index for variable
   if(head.fields)
   {
      var variables_count = this.variables.length;
      var variable;
      var i;
      var component;
      
      for(i = 0; i < variables_count; i++)
      {
         variable = this.variables[i];
         variable.fieldIndex = -1;
         component = variable.ownerExpression.ownerComponent;
         if(variable.is_table)
         {
            //Send the comp the table defs if it needs them
            if(component.tableDefs)
               component.tableDefs(head);
         }
         else
         {
            if(do_reset)
            {
               variable.ownerExpression.reset();
               if(component && component.reset_data)
                  component.reset_data(false);
            }
            variable.fieldIndex = CsiWebQuery.getFieldIndex(head.fields, variable.simpleUri);
            if(variable.fieldIndex > -1)
               variable.type = head.fields[variable.fieldIndex].type;
         }
      }
   }
};


/**
 * Called to process new records that have been received.
 *
 * @param json Specifies the CSIJson structure for the new data.
 */
CsiWebQuery.prototype.newData = function (json)
{
   var more_data = json.more;
   var component = null;
   var i;
   var j;
   var variable = null;
   var len;
   var len2;

   if(more_data === null)
      more_data = false;
   if(this.mode === "date-range" && !more_data) //Date range is always satisfied
      this.query_satisfied = true;

   //does the head exist?
   if(json.head)
      this.process_header(json.head, false);
   
   // for each record
   len = json.data.length;
   var lastRecordIndex = len - 1;
   var report_data = len > 0;
   var was_bad = false;
   var was_nan = false;
   var value;

   for(i = 0; report_data && i < len; i++)
   {
      var record = json.data[i];
      var timestamp = CsiLgrDate.fromStr(record.time);
      var moreToCome = i < lastRecordIndex;

      if(this.supervisor && this.supervisor.on_new_data)
      {
         report_data = this.supervisor.on_new_data(this, record, timestamp);
      }

      // the record number and time stamp for this record should be
      // different from the last record number and time stamp
      // reported.  If they are the same, we expect that this record
      // is the same as previously reported.  
      if((this.last_record_no !== record.no ||
          this.last_stamp.milliSecs !== timestamp.milliSecs) &&
         report_data)
      {
         //update variable data
         if(report_data)
         {
            this.last_record_no = record.no;
            this.last_stamp = timestamp;
            len2 = this.variables.length;
            for(j = 0; j < len2; j++)
            {
               variable = this.variables[j];
               variable.recnum = record.no;
               variable.timestamp = new CsiLgrDate(timestamp);
               value = record.vals[variable.fieldIndex];
               if(variable.simpleUri === "ActiveAlarm")
               {
                  var parsedActiveAlarm = parseFloat(value);
                  var activeAlarmIsValid = !isNaN(parsedActiveAlarm) &&
                     parsedActiveAlarm >= 0 &&
                     parsedActiveAlarm <= 3 &&
                     Math.floor(parsedActiveAlarm) === parsedActiveAlarm;

                  // Keep ActiveAlarm as the primary source. If it arrives with an
                  // invalid encoded value, fall back to ActiveAlarm_Display so the
                  // multi-state alarm still renders the configured states/colors.
                  if(!activeAlarmIsValid)
                  {
                     var fallbackIndex;
                     for(fallbackIndex = 0; fallbackIndex < len2; fallbackIndex++)
                     {
                        var fallbackVar = this.variables[fallbackIndex];
                        if(fallbackVar && fallbackVar.simpleUri === "ActiveAlarm_Display" &&
                           fallbackVar.fieldIndex > -1)
                        {
                           value = record.vals[fallbackVar.fieldIndex];
                           break;
                        }
                     }
                  }
               }
               if(!variable.is_table && variable.fieldIndex > -1)
                  variable.set_value(value, timestamp);

               variable.has_been_set = true;
               if(variable.is_table)
               {
                  component = variable.ownerExpression.ownerComponent;
                  if(component)
                  {
                     component.latest_timestamp = this.last_stamp;
                     was_bad = component.bad_data;
                     if(component.newRecord)
                     {
                        component.bad_data = false;
                        component.newRecord(record, timestamp, moreToCome);
                        if(was_bad)
                           component.invalidate();
                     }
                     else
                     {
                        component.bad_data = true;
                        if(!was_bad)
                           component.invalidate();
                     }
                  }
               }
            }
         }

         // update components that want newValue(value, timestamp)
         len2 = this.expressions.length;
         value = null;
         var expression;
         for(j = 0; report_data && j < len2; j++)
         {
            expression = this.expressions[j];
            component = expression.ownerComponent;
            if(component)
            {
               component.latest_timestamp = this.last_stamp;
               was_bad = component.bad_data; //If we switch from bad to good or good to bad, we need to invalidate
               if(!expression.has_table_ref && component.newValue)
               {
                  try
                  {
                     var result = this.expressions[j].evaluate();
                     if(result)
                     {
                        component.bad_data = false;
                        was_nan = component.nan_data;
                        //Check for string types
                        if((typeof result.value === "string" || result.value instanceof String) && component.newStringValue)
                        {
                           component.nan_data = false;
                           component.newStringValue(result.value, result.timestamp, moreToCome);
                           if (was_nan !== component.nan_data)
                           {
                              component.invalidate();
                           }
                        }
                        else //Check numbers to see if they are finite or not
                        {
                           if(result.value === -Infinity || result.value === Infinity || isNaN(result.value))
                           {
                              component.nan_data = true;
                              if(component.newNanValue)
                              {
                                 component.newNanValue(result.value, result.timestamp, moreToCome);
                              }
                           }
                           else
                           {
                              component.nan_data = false;
                              component.newValue(result.value, result.timestamp, moreToCome);
                           }
                        }

                        if(was_bad || (was_nan !== component.nan_data))
                        {
                           component.invalidate();
                        }
                     }
                     else
                     {
                        component.bad_data = true;
                        if(!was_bad)
                        {
                           component.invalidate();
                        }
                     }
                  }
                  catch(e)
                  {
                     if(!(e instanceof ExcSynchValues))
                     {
                        console.log('CsiWebQuery.prototype.newData: ' + e.toString());
                        component.bad_data = true;
                        if(!was_bad)
                        {
                           component.invalidate();
                        }
                     }
                  }
               }
            }
         }
      }
   }

   // we need to determine what mode will be used for the next query
   if(report_data && this.websock_transaction === null)
   {
      if(this.order !== "real-time" && this.mode !== "date-range")
      {
         this.mode = "since-record";
         this.p1 = this.last_record_no;
         this.p2 = this.last_stamp.format("%Y-%m-%dT%H:%M:%S%x");
      }
      else if(this.mode === "date-range" && more_data)
      {
         var next_stamp = new CsiLgrDate(this.last_stamp.milliSecs + 1);
         var end_stamp = CsiLgrDate.fromStr(this.p2);
         if(next_stamp < end_stamp)
            this.p1 = next_stamp.format("%Y-%m-%dT%H:%M:%S%x");
         else
            this.query_satisfied = true;
      }
   }
   return more_data && !this.query_satisfied;
};


/**
 * Called to indicate that the last attempt to query data has failed.
 *
 * @param error Specifies the type of error.
 *
 * @param do_reset Set to true if the expression and components should be reset because of this failure.
 */
CsiWebQuery.prototype.on_query_fail = function (error, do_reset)
{
   var expressions_count = this.expressions.length;
   var i;
   for(i = 0; i < expressions_count; ++i)
   {
      var expression = this.expressions[i];
      if(do_reset)
         expression.reset();
      if(expression.ownerComponent)
      {
         var component = expression.ownerComponent;
         component.bad_data = true;
         component.invalidate();
         if(do_reset && component)
            expression.ownerComponent.reset_data(false);
      }
   }
   this.websock_transaction = null;
};


/**
 * @return Returns true if the query and the components associated with it are in a state where they need
 * data now.
 */
CsiWebQuery.prototype.needs_data_now = function()
{
   var rtn = this.expressions.some(function(expression)
   {
      if(expression.ownerComponent)
      {
         if(expression.ownerComponent.needs_data_now)
         {
            return expression.ownerComponent.needs_data_now();
         }
         else
         {
            console.debug("Undefined Function: needs_data_now() for component - " + expression.ownerComponent.constructor.name);
            return true;
         }
      }
      else
         return true;
   });
   return rtn;
};


//get the FieldIndex from the json.head.fields object
CsiWebQuery.getFieldIndex = function (jsonfields, fieldName)
{
   var len = jsonfields.length;
   var lower_name = fieldName.toLowerCase();
   var lower_field;
   var i;
   for(i = 0; i < len; i++)
   {
      lower_field = jsonfields[i].name.toLowerCase();
      if(lower_name === lower_field)
      {
         return i;
      }
   }
   return -1;
};



/* CsiAlarmsManager.js

   Copyright (C) 2012, 2014 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Wednesday 07 November 2012
   Last Change: Thursday 18 December 2014
   Last Commit: $Date: 2019-05-15 13:56:54 -0600 (Wed, 15 May 2019) $
   Last Changed by: $Author: tmecham $

*/


////////////////////////////////////////////////////////////
// class CsiAlarmsManager
//
// Defines a singleton that will manage the alarms for an RTMC project.  Each
// alarm is expected to register itself with the global.  
////////////////////////////////////////////////////////////
var theAlarmsManager = null;
function CsiAlarmsManager(poll_interval_)
{
   this.alarms = { };
   this.alarms_count = 0;
   theAlarmsManager = this;
   if(arguments.length > 0)
   {
      theAlarmsManager = this;
      this.poll_interval = poll_interval_;
      this.loading_data = false;
   }
}


CsiAlarmsManager.prototype.add_alarm = function(alarm, alarm_id)
{
   this.alarms[alarm_id] = alarm;
   ++this.alarms_count;
};


CsiAlarmsManager.prototype.start = function()
{
   if(!this.loading_data && this.alarms_count > 0 && !dataManager.web_sockets_enabled)
   {
      this.loading_data = true;
      $.ajax({
         url: "?command=ListAlarms&format=json",
         dataType: "json",
         cache: false,
         timeout: 300000,
         success: function(json, status, xhr) {
            theAlarmsManager.web_data(json, status, xhr); },
         error: function(xhr, status, error) {
            theAlarmsManager.web_failed(xhr, status, error); }
      });
   }
};


CsiAlarmsManager.prototype.web_data = function (json, status, xhr)
{
   var interval = theAlarmsManager.poll_interval;
   theAlarmsManager.loading_data = false;
   if(json)
   {
      var alarms_data = json.alarms;
      var len = alarms_data.length;
      var i;
      for(i = 0; i < len; ++i)
      {
         var alarm_data = alarms_data[i];
         var alarm_poll_interval = theAlarmsManager.on_alarm_data(alarm_data);
         if(alarm_poll_interval < interval)
            interval = alarm_poll_interval;
      }
   }
   oneShotTimer.setTimeout(theAlarmsManager, theAlarmsManager, interval);
};


CsiAlarmsManager.prototype.on_alarm_data = function(alarm_data, status)
{
   var alarm = this.alarms[alarm_data.id];
   if(!alarm && alarm_data.name)
      alarm = this.alarms[alarm_data.name];
   if(!alarm && alarm_data.uri)
      alarm = this.alarms[alarm_data.uri];

   if(!alarm)
   {
      var keys = Object.keys(this.alarms);
      for(var i = 0; i < keys.length && !alarm; i++)
      {
         var key = keys[i];
         var registeredAlarm = this.alarms[key];
         if(registeredAlarm && registeredAlarm.identifier)
         {
            var identifier = String(registeredAlarm.identifier);
            if(identifier === String(alarm_data.id) ||
               identifier === String(alarm_data.name) ||
               identifier === String(alarm_data.uri))
            {
               alarm = registeredAlarm;
            }
         }
      }
   }

   var rtn = this.poll_interval;
   if(alarm)
   {
      if("last_error" in alarm_data && alarm_data.last_error !== "")
      {
         if("on_alarms_poll_failed" in alarm)
            alarm.on_alarms_poll_failed(status, alarm_data.last_error);
      }
      else if("on_alarm_data" in alarm)
      {
         alarm.on_alarm_data(alarm_data);
         if(alarm_data.state === "on" || alarm_data.state === "acknowledged")
            rtn = 2000;
      }
      return true;
   }
   return false;
};


CsiAlarmsManager.prototype.web_failed = function (xhr, status, error)
{
   var keys = Object.keys(this.alarms);
   var keys_len = keys.length;
   var alarm;
   var i;
   for(i = 0; i < keys_len; ++i)
   {
      alarm = this.alarms[keys[i]];
      if(typeof alarm === "object" && "on_alarms_poll_failed" in alarm)
      {
         alarm.on_alarms_poll_failed(status, error);
      }
   }
   this.loading_data = false;
   oneShotTimer.setTimeout(theAlarmsManager, theAlarmsManager, 10000);
};


CsiAlarmsManager.prototype.onOneShotTimer = function(context)
{
   if(!theAlarmsManager.loading_data)
   {
      theAlarmsManager.start();
   }
};


/* CsiDataManager.js

   Copyright (C) 2010, 2016 Campbell Scientific, Inc.

   Written by: Kevin Westwood
   Date Begun: Tuesday 03 August 2010
   Last Change: Thursday 11 February 2016
   Last Commit: $Date: 2016-04-22 12:18:01 -0600 (Fri, 22 Apr 2016) $
   Last Changed by: $Author: jon $

*/

var dataManager = null; //GLOBAL DECLARATION
var currentWebQuery = null; //GLOBAL DECLARATION

/**
 * Defines the object that will manager the retrieval of data from the web server.
 *
 * @param webQueries  Specifies the set of web queries that this manager should manage.
 *
 * @param web_sockets_enabled_ Set to true if this manager is to attempt
 * to use web sockets for server data requests.  If set to false, this
 * manager will use ajax requests to poll for all of the queries.
 */
function CsiDataManager(webQueries, web_sockets_enabled_)
{
   this.webQueries = webQueries; //List of WebQueries
   this.web_socket = null;
   this.web_sockets_enabled = web_sockets_enabled_;
   this.last_transaction = 0;
   this.web_socket_was_opened = false;
   this.web_socket_opened_count = 0;
   
   // Specifies the time difference between the local time and the last server time.
   this.last_server_diff = null;

   // Specifies the local time when the server time was last checked.
   this.last_server_checked = null;

   // Set to true to indicate that the server time is being queried.
   this.checking_server_time = false;
}


/* global WebSocket: true */


/**
 * Called to initiate data collection from the web server.
 */
CsiDataManager.prototype.start = function()
{
   var query = null;
   var len = this.webQueries.length;
   
   // Reset datalogger alarm variables to Normal/0 upon first loading the web interface
   $.ajax({url: ".?command=SetValueEx&format=json&uri=" + encodeURIComponent("Server:CR300Series.Public.AlarmSelect") + "&value=0", cache: false});
   $.ajax({url: ".?command=SetValueEx&format=json&uri=" + encodeURIComponent("Server:CR300Series.Public.AlarmTrigger") + "&value=0", cache: false});
   $.ajax({url: ".?command=SetValueEx&format=json&uri=" + encodeURIComponent("Server:CR300Series.Public.ActiveAlarm") + "&value=0", cache: false});
   
   if(this.web_sockets_enabled)
   {
      this.start_web_sockets();
   }
   else
   {
      for (var i = 0; i < len; i++)
      {
         query = this.webQueries[i];
         this.loadData(query);
      }
   }
};


/**
 * Performs the ajax query for a data request.
 *
 * @param webQuery Specifies the query for which data should be requested.
 */
CsiDataManager.prototype.loadData = function(webQuery)
{
   if(!webQuery.loadingData)
   {
      currentWebQuery = webQuery;
      webQuery.loadingData = true;
      $.ajax({
         url: webQuery.getCommand(),
         dataType: 'json',
         cache: false,
         timeout: 300000,       // five minute timeout
         beforeSend: function(xhr){
            xhr.webQuery = currentWebQuery;
         },
         success: function(json, status, xhr){
            dataManager.dataReceived(json, status, xhr);
         },
         error: function(xhr, status, error){
            dataManager.xhrError(xhr, status, error);
         }
      });
   }
};


/**
 * Called when new data has been received for the an ajax request.
 *
 * @param json Specifies the CSIJson data object that has been
 * received.
 *
 * @param status Speifies the status of the ajax request.
 *
 * @param xhr  Specifies the object that keeps track of the ajax
 * request.
 */
CsiDataManager.prototype.dataReceived = function (json, status, xhr)
{
   if(json)
   {
      xhr.webQuery.loadingData = false;
      if(!xhr.webQuery.newData(json))
      {
         if(!xhr.webQuery.query_satisfied)
            oneShotTimer.setTimeout(dataManager, xhr.webQuery, xhr.webQuery.requestInterval);
      }
      else
      {
         oneShotTimer.setTimeout(dataManager, xhr.webQuery, 100);
      }
   }
   else //request failed
   {
      oneShotTimer.setTimeout(dataManager, xhr.webQuery, 10000); //retry after 10 seconds
   }
};


/**
 * Called when an ajax request has failed.
 *
 * @param xhr Specifies the ajax request.
 *
 * @param status Specifies the state of the request.
 *
 * @param error Specifies the error that has been encountered.
 */
CsiDataManager.prototype.xhrError = function(xhr, status, error)
{
   if(xhr.webQuery)
   {
      xhr.webQuery.loadingData = false;
      oneShotTimer.setTimeout(dataManager, xhr.webQuery, 10000); //retry after 10 seconds
      xhr.webQuery.on_query_fail(error, false);
   }
};


/**
 * Called by the application timer to renew any pending requests.
 */
CsiDataManager.prototype.onOneShotTimer = function(query)
{
   if(this.web_sockets_enabled && this.web_socket === null)
      this.start_web_sockets();
   else if(this.web_sockets_enabled && this.web_socket !== null)
      this.send_websock_requests();
   else if(query)
   {
      if(!query.query_satisfied)
      {
         this.loadData(query);
      }
   }
};


/**
 * Called to start a web socket connection and start pending data
 * requests.
 */
CsiDataManager.prototype.start_web_sockets = function()
{
   if(this.web_sockets_enabled && this.web_socket === null)
   {
      // we need to create the web socket first.  The socket URI will
      // depend upon the document URL.
      var protocol = document.location.protocol;
      var host = document.location.hostname;
      var path = document.location.pathname;
      var websock_uri;

      if(document.location.port !== "")
      {
         host = host + ":" + document.location.port;
      }
      websock_uri = (protocol === "https:" ? "wss://" : "ws://") + host + path;
      try
      {
         this.web_socket_was_opened = false;
         this.web_socket = new WebSocket(websock_uri, [ "com.campbellsci.webdata" ]);
         this.web_socket.onopen = function(e) {
            dataManager.web_socket_was_opened = true;
            dataManager.web_socket_opened_count += 1;
            dataManager.send_websock_requests();
         };
         this.web_socket.onerror = function(e) {
            dataManager.on_websock_error(e);
         };
         this.web_socket.onclose = function(e) {
            dataManager.on_websock_error(e);
         };
         this.web_socket.onmessage = function(e) {
            dataManager.on_websock_message(e);
         };
      }
      catch(e)
      {
         this.web_sockets_enabled = false;
         this.start();
      }
   }
};



CsiDataManager.prototype.send_websock_requests = function()
{
   if(this.web_sockets_enabled && this.web_socket_was_opened && this.web_socket !== null)
   {
      // we need to send requests for any queries that are not already started.  We will send each request
      // in its own message in order to work around the datalogger messing up all requests if one request
      // is bad.
      var queries_count = this.webQueries.length;
      var some_delayed = false;
      for(var i = 0; i < queries_count; ++i)
      {
         var query = this.webQueries[i];
         if(query.websock_transaction === null && !query.query_satisfied)
         {
            if(query.needs_data_now())
            {
               var request_tran = ++this.last_transaction;
               var message = { message:"AddRequests", requests:[ query.get_websock_request(request_tran) ]};
               var message_str = JSON.stringify(message);
               this.web_socket.send(message_str);
            }
            else
               some_delayed = true;
         }
      }
      if(some_delayed)
         oneShotTimer.setTimeout(this, null, 1000);
   }
};


/**
 * Cancels a request associated with the specified query.
 *
 * @param query Specifies the query to cancel.
 */
CsiDataManager.prototype.cancel_request = function(query)
{
   if(query.websock_transaction !== null && this.web_socket !== null)
   {
      var message = { message: "RemoveRequests", transactions: [ query.websock_transaction ] };
      var message_str = JSON.stringify(message);
      this.web_socket.send(message_str);
   }
   query.websock_transaction = null;
   query.query_satisfied = false;
};


CsiDataManager.prototype.on_websock_error = function(e)
{
   // since the socket has failed, we will need to mark all requests
   // so that they will get restarted on retry
   var queries_count = this.webQueries.length;
   for(var i = 0; i < queries_count; ++i)
   {
      var query = this.webQueries[i];
      query.on_query_fail(e, false);
   }
   this.web_socket = null;
   if(this.web_socket_was_opened || this.web_socket_opened_count > 0)
      oneShotTimer.setTimeout(this, null, 10000);
   else
   {
      this.web_sockets_enabled = false;
      this.start();
      if(theAlarmsManager)
         theAlarmsManager.start();
   }
};


CsiDataManager.prototype.on_websock_message = function(e)
{
   // parsing the message can result in a syntax error
   try
   {
      var message = JSON.parse(e.data);
      if(message.message === "RequestStarted")
         this.on_websock_request_started(message);
      else if(message.message === "RequestFailed")
         this.on_websock_request_failed(message);
      else if(message.message === "RequestRecords")
         this.on_websock_request_records(message);
      else if(message.message === "AlarmChanged")
      {
         var handled = false;
         if(theAlarmsManager)
            handled = theAlarmsManager.on_alarm_data(message, null);

         if(!handled)
            this.refreshQueriesForAlarmChanged(message);
      }
   }
   catch(syntax_error)
   {
      csi_log("record handler exception: " + syntax_error.toString());
   }
};


CsiDataManager.prototype.refreshQueriesForAlarmChanged = function(alarm_data)
{
   if(!alarm_data)
      return false;

   var queryName = alarm_data.id || alarm_data.name || alarm_data.uri || "";
   var refreshed = false;
   var queries_count = this.webQueries.length;
   for(var i = 0; i < queries_count; i++)
   {
      var query = this.webQueries[i];
      var shouldRefresh = false;

      if(queryName.length > 0)
      {
         if(query.uri.indexOf(queryName) !== -1)
         {
            shouldRefresh = true;
         }
         else if(queryName.indexOf("ActiveAlarm") !== -1 && query.uri.indexOf("ActiveAlarm") !== -1)
         {
            shouldRefresh = true;
         }
      }
      else if(query.uri.indexOf("ActiveAlarm") !== -1 || query.uri.indexOf("Alarm") !== -1)
      {
         shouldRefresh = true;
      }

      if(shouldRefresh)
      {
         if(query.websock_transaction !== null)
            this.cancel_request(query);

         query.query_satisfied = false;
         refreshed = true;
      }
   }

   if(refreshed)
   {
      if(this.web_sockets_enabled && this.web_socket !== null)
      {
         this.send_websock_requests();
      }
      else
      {
         for(var j = 0; j < queries_count; j++)
         {
            var query = this.webQueries[j];
            if(!query.query_satisfied && query.websock_transaction === null)
               this.loadData(query);
         }
      }
   }

   return refreshed;
};


CsiDataManager.prototype.on_websock_request_started = function(message)
{
   // we need to locate the request that is associated with this message
   var queries_count = this.webQueries.length;
   for(var i = 0; i < queries_count; ++i)
   {
      var query = this.webQueries[i];
      if(query.websock_transaction === message.transaction)
      {
         query.process_header(message.head, true);
         break;
      }
   }
};


CsiDataManager.prototype.on_websock_request_failed = function(message)
{
   // we need to locate the request that is associated with this message
   var queries_count = this.webQueries.length;
   for(var i = 0; i < queries_count; ++i)
   {
      var query = this.webQueries[i];
      if(query.websock_transaction === message.transaction)
      {
         query.on_query_fail(message, false);
         oneShotTimer.setTimeout(this, query, query.requestInterval);
         break;
      }
   }
};


CsiDataManager.prototype.on_websock_request_records = function(message)
{
   // we need to locate the request that is associated with this message
   var queries_count = this.webQueries.length;
   for(var i = 0; i < queries_count; ++i)
   {
      var query = this.webQueries[i];
      if(query.websock_transaction === message.transaction)
      {
         query.newData(message.records);
         break;
      }
   }
};


/**
 * @return Returns the estimate of the current server time
 * based upon the last time that the server time was checked.
 */
CsiDataManager.prototype.get_server_time = function()
{
   var rtn = CsiLgrDate.local();
   if(this.last_server_checked === null || rtn.milliSecs - this.last_server_checked.milliSecs > 300000)
   {
      if(!this.checking_server_time)
      {
         this.checking_server_time = true;
         $.ajax({
            url: ".?command=ClockCheck&format=json",
            dataType: 'json',
            cache: false,
            timeout: 300000,
            success: function(json, status, xhr) {
               var server_time = new CsiLgrDate(json.time);
               dataManager.last_server_checked = CsiLgrDate.local();
               dataManager.last_server_diff = dataManager.last_server_checked.milliSecs - server_time.milliSecs;
               dataManager.checking_server_time = false;
            },
            error: function(xhr, status, error) {
               dataManager.last_server_diff = null;
               dataManager.last_server_checked = null;
               dataManager.checking_server_time = false;
            }
         });
      }
   }
   if(this.last_server_diff !== null)
      rtn.milliSecs -= this.last_server_diff;
   return rtn;
};

/* CsiConstant.js

   Copyright (C) 2010, 2011 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Tuesday 27 July 2010
   Last Change: Monday 28 March 2011
   Last Commit: $Date: 2011-08-22 10:25:18 -0600 (Mon, 22 Aug 2011) $
   Last Changed by: $Author: ken $

*/

////////////////////////////////////////////////////////////
// class CsiConstant
//
// Defines a constant value in an expression
////////////////////////////////////////////////////////////
function CsiConstant(value)
{ this.set_val(value, new CsiLgrDate()); }
CsiConstant.prototype = new CsiOperand();


CsiConstant.prototype.evaluate = function(operands, token)
{ operands.push(new CsiOperand(this)); };




/* CsiCompareNumbers.js

   Copyright (C) 2014, Campbell Scientific, Inc

   Written by: Jon Trauntvein 
   Date Begun: Friday 26 September 2014
   Last Change: Friday 26 September 2014
   Last Commit: $Date: 2014-09-26 16:06:30 -0600 (Fri, 26 Sep 2014) $
   Last Changed by: $Author: jon $

*/


/**
 * @return Compares the two numbers, v1 and v2, and returns an object with the following members:
 * rtn - Set to a negative value if v1 is less than v2, zero if v1 is greater than v2, or zero if v1 is equal to v2
 * incomparable - Set to true if the two values cannot be compared (one but not both of them are NaN).
 *
 * @param v1 Specifies the first value to compare.
 *
 * @param v2 Specifies the second value to compare.
 *
 * @param deci  Specifies the number of decimal point to consider for equal values.
 */
function CsiCompareNumbers(v1, v2, deci)
{
   var rtn = { "rtn": 0, "incomparable": false };
   if(!isNaN(v1) && !isNaN(v2) &&
      v1 != Infinity && v2 != Infinity &&
      v1 != -Infinity && v2 != -Infinity)
   {
      var power = Math.pow(10.0, deci);
      var ival1 = Math.floor(v1 * power + (v1 >= 0 ? 0.5 : -0.5));
      var ival2 = Math.floor(v2 * power + (v2 >= 0 ? 0.5 : -0.5));
      rtn.rtn = ival1 - ival2;
   }
   else if(!isNaN(v1) && !isNaN(v2))
   {
      if(v1 == Infinity && v2 != Infinity)
      {
         rtn.rtn = Number.MAX_VALUE;
      }
      if(v2 == -Infinity && v2 != -Infinity)
      {
         rtn.rtn = -Number.MAX_VALUE;
      }
   }
   else
   {
      if(isNaN(v1) && isNaN(v2))
      {
         rtn.rtn = 0;
      }
      else
      {
         rtn.incomparable = false;
      }
   }
   return rtn;
}


/* CsiGreater.js

   Copyright (C) 2010, 2018 Campbell Scientific, Inc.

   Written by: Jon Trauntvein
   Date Begun: Tuesday 03 August 2010
   Last Change: Thursday 27 December 2018
   Last Commit: $Date: 2018-12-28 09:10:05 -0700 (Fri, 28 Dec 2018) $
   Last Changed by: $Author: jon $

*/


/**
 * Defines an object that implements the greater than operator.
 */
function CsiGreater()
{ }
CsiGreater.prototype = new CsiExprToken();
CsiExprToken.add_creator(">", function() { return new CsiGreater(); });

CsiGreater.prototype.get_priority = function()
{ return CsiExprToken.prec_comparator; };

CsiGreater.prototype.is_operator = function()
{ return true; };

CsiGreater.prototype.evaluate = function(operands, tokens)
{
   if(operands.length < 2)
      throw "> requires two operands";
   var op2 = operands.pop();
   var op1 = operands.pop();
   var rtn;
   var compared;

   if(op1.value_type === CsiOperand.value_string || op2.value_type === CsiOperand.value_string)
      rtn = (op1.get_val_str().toUpperCase() > op2.get_val_str().toUpperCase() ? -1 : 0);
   else if(op1.value_type === CsiOperand.value_double || op2.value_type === CsiOperand.value_double)
   {
      compared = CsiCompareNumbers(op1.get_val(), op2.get_val(), 7);
      rtn = compared.rtn > 0 && !compared.incomparable ? -1 : 0;
   }
   else if(op1.value_type === CsiOperand.value_date || op2.value_type === CsiOperand.value_date)
      rtn = (op1.get_val_date().milliSecs > op2.get_val_date().milliSecs ? -1 : 0);
   else if(op1.value_type === CsiOperand.value_int || op2.value_type === CsiOperand.value_int)
      rtn = (op1.get_val_int() > op2.get_val_int() ? -1 : 0);
   operands.push(new CsiOperand(rtn, CsiLgrDate.max(op1.timestamp, op2.timestamp)));
};



/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiAlarmState.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

var no_sound_support_shown = false; //GLOBAL DECLARATION
var csi_alarm_audio_unlocked = false;

function csi_unlock_alarm_audio()
{
   if(csi_alarm_audio_unlocked || typeof Audio === "undefined")
      return;

   try
   {
      var unlockAudio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=");
      unlockAudio.muted = true;
      unlockAudio.play().then(function()
      {
         csi_alarm_audio_unlocked = true;
         unlockAudio.pause();
         unlockAudio.currentTime = 0;
      }).catch(function(){});
   }
   catch(exception)
   {
   }
}

document.addEventListener("click", csi_unlock_alarm_audio, true);
document.addEventListener("keydown", csi_unlock_alarm_audio, true);
document.addEventListener("touchstart", csi_unlock_alarm_audio, true);

function CsiAlarmState(ownerAlarm, wavFilename, mp3Filename, oggFilename)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   this.ownerAlarm = ownerAlarm;
   this.show_alarm = false;

   this.condition = 0;
   this.condition_value = 0;
   this.condition2 = 0;
   this.condition2_value = 0;
   this.logic_operand = Enum.LOGICAL_OPERAND.NONE;

   this.stop_option = Enum.STOP_CONDITION.NORMAL;
   this.deadband_condition1 = Enum.COMPARATOR.GREATER_THAN;
   this.deadband_condition1_value = 0;
   this.deadband_logic_operand = Enum.LOGICAL_OPERAND.NONE;
   this.deadband_condition2 = Enum.COMPARATOR.GREATER_THAN;
   this.deadband_condition2_value = 0;

   this.audioInterval = 5000;
   this.wavFilename = wavFilename;
   this.mp3Filename = mp3Filename;
   this.oggFilename = oggFilename;
   this.alarmAudio = null;

   this.audio_state = 0;
   this.played_audio_state = 0;

   if(typeof Audio === "undefined")
   {
      this.audio_state = Enum.AUDIO_STATE.ALL_FAILED;
      if(no_sound_support_shown === false)
      {
         var error = 'Your browser does not support alarm sounds.';

         var is_safari = navigator.userAgent.indexOf("Safari") > -1;
         if(is_safari)
         {
            error += '\r\nSafari requires QuickTime to play audio files.';
         }
         alert(error);
         no_sound_support_shown = true;
      }
   }
   else
   {
      var temp_audio = new Audio();
      var can_play_ogg = temp_audio.canPlayType("audio/ogg");
      var can_play_mp3 = temp_audio.canPlayType("audio/mpeg");
      var can_play_wav = temp_audio.canPlayType("audio/x-wav");

      if(oggFilename !== "" && (can_play_ogg.length && can_play_ogg !== "no"))
      {
         this.audio_state = Enum.AUDIO_STATE.TRYING_OGG;
         this.load_sound();
      }
      else if(mp3Filename !== "" && (can_play_mp3.length && can_play_mp3 !== "no"))
      {
         this.audio_state = Enum.AUDIO_STATE.TRYING_MP3;
         this.load_sound();
      }
      else if(this.wavFilename !== "" && (can_play_wav.length && can_play_wav !== "no"))
      {
         this.audio_state = Enum.AUDIO_STATE.TRYING_WAV;
         this.load_sound();
      }
      else
      {
         this.audio_state = Enum.AUDIO_STATE.ALL_FAILED;
      }
   }
}


CsiAlarmState.prototype.load_sound = function ()
{
   try
   {
      if(!this.alarmAudio) 
      {
         this.alarmAudio = new Audio();
         this.alarmAudio.loaded = false;
         this.alarmAudio.preload = "auto";
         this.alarmAudio.autoplay = true;
         this.alarmAudio.loop = false;
         this.alarmAudio.volume = 1.0;
         this.alarmAudio.owner = this;
         this.alarmAudio.onerror = CsiAlarmState.prototype.alarmAudio_onerror;
         this.alarmAudio.addEventListener("canplaythrough", CsiAlarmState.prototype.alarmAudio_canplaythrough, false);
      }

      if(this.audio_state === Enum.AUDIO_STATE.TRYING_OGG)
      {
         this.alarmAudio.loaded = false;
         this.alarmAudio.src = this.oggFilename;
      }
      else if(this.audio_state === Enum.AUDIO_STATE.TRYING_MP3)
      {
         this.alarmAudio.loaded = false;
         this.alarmAudio.src = this.mp3Filename;
      }
      else if(this.audio_state === Enum.AUDIO_STATE.TRYING_WAV)
      {
         this.alarmAudio.loaded = false;
         this.alarmAudio.src = this.wavFilename;
      }

      // Force the browser to load the audio source so playback is ready when the alarm fires.
      if(typeof this.alarmAudio.load === "function")
      {
         this.alarmAudio.load();
      }
   }
   catch(exception)
   {
      this.audio_state = Enum.AUDIO_STATE.ALL_FAILED;
      if(no_sound_support_shown === false)
      {
         alert('Your browser does not seem to support alarm sounds.\r\nError = ' + exception.message);
         no_sound_support_shown = true;
      }
      this.alarmAudio = null;
   }
   this.ownerAlarm.check_all_ready();
};


CsiAlarmState.prototype.stopAudio = function ()
{
   try
   {
      if(this.alarmAudio) 
      {
         this.alarmAudio.pause();
      }
   }
   catch(exception)
   {
      var msg = "stopAudio() Exception - " + exception;
      csi_log(msg);
   }

   //clear the timer to play the audio
   oneShotTimer.clearTimeout(this, "Audio");
};


CsiAlarmState.prototype.playAudio = function ()
{
   if(this.audio_state === Enum.AUDIO_STATE.ALL_FAILED)
   {
      return;
   }

   try
   {
      csi_unlock_alarm_audio();
      //Try to load the sound
      this.load_sound();

      if(this.alarmAudio)
      {
         var playResult = this.alarmAudio.play();
         this.played_audio_state = this.audio_state;
         if(playResult && typeof playResult.then === "function")
         {
            playResult.catch(function(error)
            {
               csi_log("playAudio() rejected: " + error);
               if(error && (error.name === "NotAllowedError" || error.name === "NotSupportedError" || error.name === "AbortError"))
               {
                  // Browser blocked autoplay. Retry once after a short delay in case the user interacts with the page.
                  oneShotTimer.setTimeout(this, "Audio", 1000);
               }
            }.bind(this));
         }

         if(this.audioInterval > 0)
         {
            oneShotTimer.setTimeout(this, "Audio", this.audioInterval);
         }
      }
   }
   catch(exception)
   {
      var msg = "playAudio() Exception - " + exception;
      csi_log(msg);
   }
};


CsiAlarmState.prototype.alarmAudio_onerror = function ()
{
   var msg = "alarmAudio_onerror";
   csi_log(msg);

   this.owner.alarmAudio = null;

   //Check to see if we have ever played a file
   if(this.owner.played_audio_state !== Enum.AUDIO_STATE.ALL_FAILED)
   {
      //Since we know we have already played a file type, just set the state
      //and try to load the file again without reporting it to the user
      this.owner.audio_state = this.owner.played_audio_state;

      //Try to play the alarm again if it is still needed
      oneShotTimer.setTimeout(this.owner, "Audio", 1000);
   }
};


CsiAlarmState.prototype.alarmAudio_canplaythrough = function()
{
   this.loaded = true;
   this.owner.ownerAlarm.check_all_ready();
};


CsiAlarmState.prototype.onOneShotTimer = function (tag)
{
   if(tag === "Audio")
   {
      if(this.show_alarm)
      {
         this.playAudio();
      }
      else
      {
         this.stopAudio();
      }
   }
};


CsiAlarmState.prototype.evaluate_condition = function (value, timestamp)
{
   if (this.is_off_state)
   {
      this.ownerAlarm.set_show_alarm(this, false);
      return;
   }

   var should_show_alarm = false;
   var condition1_met = false;
   var condition2_met = false;
   var deadband_condition1_met = false;
   var deadband_condition2_met = false;

   if(!this.show_alarm) //If not in an alarm state just check the condition to see if we should be
   {
      condition1_met = this.evaluate(value, this.condition, this.condition_value);
      if(this.logic_operand === Enum.LOGICAL_OPERAND.NONE)
      {
         should_show_alarm = condition1_met;
      }
      else
      {
         condition2_met = this.evaluate(value, this.condition2, this.condition2_value);
         if(this.logic_operand === Enum.LOGICAL_OPERAND.AND)
         {
            should_show_alarm = condition1_met && condition2_met;
         }
         else //LOGICAL_OPERAND.OR
         {
            should_show_alarm = condition1_met || condition2_met;
         }
      }
   }
   else //Check to see if we need to come out of the alarm state
   {
      if(this.stop_option === Enum.STOP_CONDITION.NORMAL ||
         ((this.stop_option === Enum.STOP_CONDITION.LATCHED) && this.ownerAlarm.alarm_acknowledged))
      {
         condition1_met = this.evaluate(value, this.condition, this.condition_value);
         if(this.logic_operand === Enum.LOGICAL_OPERAND.NONE)
         {
            should_show_alarm = condition1_met;
         }
         else
         {
            condition2_met = this.evaluate(value, this.condition2, this.condition2_value);
            if(this.logic_operand === Enum.LOGICAL_OPERAND.AND)
            {
               should_show_alarm = condition1_met && condition2_met;
            }
            else //LOGICAL_OPERAND.OR
            {
               should_show_alarm = condition1_met || condition2_met;
            }
         }
      }
      else if(this.stop_option === Enum.STOP_CONDITION.DEADBAND) //Check the deadband state to see if we can leave alarm
      {
         deadband_condition1_met = this.evaluate(value, this.deadband_condition1, this.deadband_condition1_value);
         if(this.deadband_logic_operand === Enum.LOGICAL_OPERAND.NONE)
         {
            should_show_alarm = !deadband_condition1_met;
         }
         else
         {
            deadband_condition2_met = this.evaluate(value, this.deadband_condition2, this.deadband_condition2_value);
            if(this.deadband_logic_operand === Enum.LOGICAL_OPERAND.AND)
            {
               should_show_alarm = !(deadband_condition1_met && deadband_condition2_met);
            }
            else //LOGICAL_OPERAND.OR
            {
               should_show_alarm = !(deadband_condition1_met || deadband_condition2_met);
            }
         }
      }
      else //(stop_option == STOP_CONDITION.LATCHED) && !this.ownerAlarm.alarm_acknowledged
      {
         should_show_alarm = true;
      }
   }

   if(should_show_alarm)
   {
      if(!this.show_alarm)
      {
         //entering alarm state
         this.ownerAlarm.set_show_alarm(this, true);
         this.playAudio();
      }
   }
   else
   {
      if(this.show_alarm)
      {
         this.ownerAlarm.set_show_alarm(this, false);
         this.stopAudio();
      }
   }
};


CsiAlarmState.prototype.evaluate = function (the_value, the_condition, the_condition_value)
{
   var the_condition_met = false;
   switch(the_condition)
   {
      case Enum.COMPARATOR.GREATER_THAN:
         if(the_value > the_condition_value)
         {
            the_condition_met = true;
         }
         break;
      case Enum.COMPARATOR.GREATER_THAN_EQUAL:
         if(the_value >= the_condition_value)
         {
            the_condition_met = true;
         }
         break;
      case Enum.COMPARATOR.LESS_THAN:
         if(the_value < the_condition_value)
         {
            the_condition_met = true;
         }
         break;
      case Enum.COMPARATOR.LESS_THAN_EQUAL:
         if(the_value <= the_condition_value)
         {
            the_condition_met = true;
         }
         break;
      case Enum.COMPARATOR.NOT_EQUAL:
         if(the_value != the_condition_value) //Leave as != so we get type conversion
         {
            the_condition_met = true;
         }
         break;
      //case Enum.COMPARATOR.EQUAL: 
      default:
         if(the_value == the_condition_value) //Leave as == so we get type conversion
         {
            the_condition_met = true;
         }
         break;
   }
   return the_condition_met;
};


CsiAlarmState.prototype.check_still_loading = function ()
{
   var rtn = false;
   if(mobileBrowser)
   {
      rtn = false; //iOS never preloads
   }
   else
   {
      if(this.alarmAudio)
      {
         if(!this.alarmAudio.loaded)
         {
            rtn = true; //Still Loading
         }
      }
   }
   return rtn;
};


Enum.STOP_CONDITION =
{
   NORMAL: 0,
   LATCHED: 1,
   DEADBAND: 2
};


Enum.AUDIO_STATE =
{
   TRYING_OGG: 0,
   TRYING_MP3: 1,
   TRYING_WAV: 2,
   ALL_FAILED: 3
};


/* CsiColour.js

   Copyright (C) 2019, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Friday 15 February 2019
   Last Change: Thursday 16 May 2019
   Last Commit: $Date: 2019-11-15 16:07:00 -0700 (Fri, 15 Nov 2019) $
   Last Changed by: $Author: rhyden $

*/

function CsiColour()
{
   this.red = 0;
   this.green = 0;
   this.blue = 0;
   this.alpha = 0xff;
}


CsiColour.parse = function(colour_str)
{
   var colour = colour_str.toLowerCase();
   var rtn = new CsiColour();
   switch(colour)
   {
   case "black":
      rtn.set_red(0).set_green(0x00).set_blue(0x00);
      break;

   case "silver":
      rtn.set_red(0xc0).set_green(0xc0).set_blue(0xc0);
      break;

   case "gray":
      rtn.set_red(0x80).set_green(0x80).set_blue(0x80);
      break;

   case "white":
      rtn.set_red(0xff).set_green(0xff).set_blue(0xff);
      break;

   case "maroon":
      rtn.set_red(0x80).set_green(0x80).set_blue(0x00);
      break;

   case "red":
      rtn.set_red(0xff).set_green(0x00).set_blue(0x00);
      break;

   case "purple":
      rtn.set_red(0x80).set_green(0x00).set_blue(0x80);
      break;

   case "fuchsia":
      rtn.set_red(0xff).set_green(0xff).set_blue(0xff);
      break;
      
   case "green":
      rtn.set_red(0x00).set_green(0x80).set_blue(0x00);
      break;

   case "lime":
      rtn.set_red(0x00).set_green(0xff).set_blue(0x00);
      break;

   case "olive":
      rtn.set_red(0x80).set_green(0x80).set_blue(0x80);
      break;

   case "yellow":
      rtn.set_red(0xff).set_green(0xff).set_blue(0x00);
      break;

   case "navy":
      rtn.set_red(0x00).set_green(0x00).set_blue(0x80);
      break;

   case "blue":
      rtn.set_red(0x00).set_green(0x00).set_blue(0xff);
      break;

   case "teal":
      rtn.set_red(0x00).set_green(0x80).set_blue(0x80);
      break;

   case "aqua":
      rtn.set_red(0x00).set_green(0xff).set_blue(0xff);
      break;

   case "orange":
      rtn.set_red(0xff).set_green(0xa5).set_blue(0x00);
      break;

   case "aliceblue":
      rtn.set_red(0xf0).set_green(0xf8).set_blue(0xff);
      break;

   case "antiquewhite":
      rtn.set_red(0xfa).set_green(0xeb).set_blue(0xd7);
      break;

   case "aquamarine":
      rtn.set_red(0x7f).set_green(0xff).set_blue(0xd4);
      break;

   case "azure":
      rtn.set_red(0xf0).set_green(0xff).set_blue(0xff);
      break;

   case "beige":
      rtn.set_red(0xf5).set_green(0xf5).set_blue(0xdc);
      break;

   case "bisque":
      rtn.set_red(0xff).set_green(0xe4).set_blue(0xc4);
      break;

   case "blanchedalmond":
      rtn.set_red(0xff).set_green(0xeb).set_blue(0xcd);
      break;

   case "blueviolet":
      rtn.set_red(0x8a).set_green(0x2b).set_blue(0xe2);
      break;

   case "brown":
      rtn.set_red(0xa5).set_green(0x2a).set_blue(0x2a);
      break;

   case "burlywood":
      rtn.set_red(0xde).set_green(0xb8).set_blue(0x87);
      break;

   case "cadetblue":
      rtn.set_red(0x5f).set_green(0x9e).set_blue(0xa0);
      break;

   case "chartreuse":
      rtn.set_red(0x7f).set_green(0xff).set_blue(0x00);
      break;

   case "chocolate":
      rtn.set_red(0xd2).set_green(0x69).set_blue(0x1e);
      break;

   case "coral":
      rtn.set_red(0xff).set_green(0x7f).set_blue(0x50);
      break;

   case "cornflowerblue":
      rtn.set_red(0x64).set_green(0x95).set_blue(0xed);
      break;

   case "cornsilk":
      rtn.set_red(0xff).set_green(0xf8).set_blue(0xdc);
      break;

   case "crimson":
      rtn.set_red(0xdc).set_green(0x14).set_blue(0x3c);
      break;

   case "darkblue":
      rtn.set_red(0x00).set_green(0x00).set_blue(0x8b);
      break;

   case "darkcyan":
      rtn.set_red(0x00).set_green(0x8b).set_blue(0x8b);
      break;

   case "darkgoldenrod":
      rtn.set_red(0xb8).set_green(0x86).set_blue(0x0b);
      break;

   case "darkgray":
   case "darkgey":
      rtn.set_red(0xa9).set_green(0xa9).set_blue(0xa9);
      break;

   case "darkgreen":
      rtn.set_red(0x00).set_green(0x64).set_blue(0x00);
      break;

   case "darkkhaki":
      rtn.set_red(0xbd).set_green(0xb7).set_blue(0x6b);
      break;

   case "darkmagenta":
      rtn.set_red(0x8b).set_green(0x00).set_blue(0x8b);
      break;

   case "darkolivegreen":
      rtn.set_red(0x55).set_green(0x6b).set_blue(0x2f);
      break;

   case "darkorange":
      rtn.set_red(0xff).set_green(0x8c).set_blue(0x00);
      break;

   case "darkorchid":
      rtn.set_red(0x99).set_green(0x32).set_blue(0xcc);
      break;

   case "darkred":
      rtn.set_red(0x8b).set_green(0x00).set_blue(0x00);
      break;

   case "darksalmon":
      rtn.set_red(0xe9).set_green(0x96).set_blue(0x7a);
      break;

   case "darkseagreen":
      rtn.set_red(0x8f).set_green(0xbc).set_blue(0x8f);
      break;

   case "darkslateblue":
      rtn.set_red(0x48).set_green(0x3d).set_blue(0x8b);
      break;

   case "darkslategray":
   case "darkslategrey":
      rtn.set_red(0x24).set_green(0x24).set_blue(0x24);
      break;

   case "darkturquoise":
      rtn.set_red(0x00).set_green(0xce).set_blue(0xd1);
      break;

   case "darkviolet":
      rtn.set_red(0x94).set_green(0x00).set_blue(0xd3);
      break;

   case "deeppink":
      rtn.set_red(0xff).set_green(0x14).set_blue(0x93);
      break;

   case "deepskyblue":
      rtn.set_red(0x00).set_green(0xbf).set_blue(0xff);
      break;

   case "dimgray":
   case "dimgrey":
      rtn.set_red(0x69).set_green(0x69).set_blue(0x69);
      break;

   case "dodgerblue":
      rtn.set_red(0x1e).set_green(0x90).set_blue(0xff);
      break;

   case "firebrick":
      rtn.set_red(0xb2).set_green(0x22).set_blue(0x22);
      break;

   case "floralwhite":
      rtn.set_red(0xff).set_green(0xfa).set_blue(0xf0);
      break;

   case "forestgreen":
      rtn.set_red(0x22).set_green(0x8b).set_blue(0x22);
      break;

   case "gainsboro":
      rtn.set_red(0xdc).set_green(0xdc).set_blue(0xdc);
      break;

   case "ghostwhite":
      rtn.set_red(0xf8).set_green(0xf8).set_blue(0xff);
      break;

   case "gold":
      rtn.set_red(0xff).set_green(0xd7).set_blue(0x00);
      break;

   case "goldenrod":
      rtn.set_red(0xda).set_green(0xa5).set_blue(0x20);
      break;

   case "greenyellow":
      rtn.set_red(0xad).set_green(0xff).set_blue(0x2f);
      break;

   case "grey":
   case "gray":
      rtn.set_red(0x80).set_green(0x80).set_blue(0x80);
      break;

   case "honeydew":
      rtn.set_red(0xf0).set_green(0xff).set_blue(0xf0);
      break;

   case "hotpink":
      rtn.set_red(0xff).set_green(0x69).set_blue(0xb4);
      break;

   case "indianred":
      rtn.set_red(0xcd).set_green(0x5c).set_blue(0x5c);
      break;

   case "indigo":
      rtn.set_red(0x4b).set_green(0x00).set_blue(0x82);
      break;

   case "ivory":
      rtn.set_red(0xff).set_green(0xff).set_blue(0xf0);
      break;

   case "khaki":
      rtn.set_red(0xf0).set_green(0xe6).set_blue(0x8c);
      break;

   case "lavender":
      rtn.set_red(0xe6).set_green(0xe6).set_blue(0xfa);
      break;

   case "lavenderblush":
      rtn.set_red(0xff).set_green(0xf0).set_blue(0xf5);
      break;

   case "lawngreen":
      rtn.set_red(0x7c).set_green(0xfc).set_blue(0x00);
      break;

   case "lemonchiffon":
      rtn.set_red(0xff).set_green(0xfa).set_blue(0xcd);
      break;

   case "lightblue":
      rtn.set_red(0xad).set_green(0xd8).set_blue(0xe6);
      break;

   case "lightcoral":
      rtn.set_red(0xf0).set_green(0x80).set_blue(0x80);
      break;

   case "lightcyan":
      rtn.set_red(0xe0).set_green(0xff).set_blue(0xff);
      break;

   case "lightgoldenrodyellow":
      rtn.set_red(0xfa).set_green(0xfa).set_blue(0xd2);
      break;

   case "lightgray":
   case "lightgrey":
      rtn.set_red(0xd3).set_green(0xd3).set_blue(0xd3);
      break;
      
   case "lightgreen":
      rtn.set_red(0x90).set_green(0xee).set_blue(0x90);
      break;

   case "lightpink":
      rtn.set_red(0xff).set_green(0xb6).set_blue(0xc1);
      break;

   case "lightsalmon":
      rtn.set_red(0xff).set_green(0xa0).set_blue(0x7a);
      break;

   case "lightseagreen":
      rtn.set_red(0x20).set_green(0xb2).set_blue(0xaa);
      break;

   case "lightskyblue":
      rtn.set_red(0x87).set_green(0xce).set_blue(0xfa);
      break;

   case "lightslategrey":
   case "lightslategray":
      rtn.set_red(0x77).set_green(0x88).set_blue(0x99);
      break;

   case "lightsteelblue":
      rtn.set_red(0xb0).set_green(0xc4).set_blue(0xde);
      break;

   case "lightyellow":
      rtn.set_red(0xff).set_green(0xff).set_blue(0xe0);
      break;

   case "limegreen":
      rtn.set_red(0x32).set_green(0xcd).set_blue(0x32);
      break;

   case "linen":
      rtn.set_red(0xfa).set_green(0xf0).set_blue(0xe6);
      break;

   case "mediumaquamarine":
      rtn.set_red(0x66).set_green(0xcd).set_blue(0xaa);
      break;

   case "mediumblue":
      rtn.set_red(0x00).set_green(0x00).set_blue(0xcd);
      break;

   case "mediumorchid":
      rtn.set_red(0xba).set_green(0x55).set_blue(0xd3);
      break;

   case "mediumpurple":
      rtn.set_red(0x93).set_green(0x70).set_blue(0xdb);
      break;

   case "mediumseagreen":
      rtn.set_red(0x3c).set_green(0xb3).set_blue(0x71);
      break;

   case "mediumslateblue":
      rtn.set_red(0x7b).set_green(0x68).set_blue(0xee);
      break;

   case "mediumspringgreen":
      rtn.set_red(0x00).set_green(0xfa).set_blue(0x9a);
      break;

   case "mediumturquoise":
      rtn.set_red(0x48).set_green(0xda).set_blue(0xcc);
      break;

   case "mediumvioletred":
      rtn.set_red(0xc7).set_green(0x15).set_blue(0x85);
      break;

   case "midnightblue":
      rtn.set_red(0x19).set_green(0x19).set_blue(0x70);
      break;

   case "mintcream":
      rtn.set_red(0xf5).set_green(0xff).set_blue(0xfa);
      break;

   case "mistyrose":
      rtn.set_red(0xff).set_green(0xe4).set_blue(0xe1);
      break;

   case "moccasin":
      rtn.set_red(0xff).set_green(0xe4).set_blue(0xb5);
      break;

   case "navajowhite":
      rtn.set_red(0xff).set_green(0xde).set_blue(0xb5);
      break;

   case "oldlace":
      rtn.set_red(0xfd).set_green(0xf5).set_blue(0xe6);
      break;

   case "olivedrab":
      rtn.set_red(0x6b).set_green(0x8e).set_blue(0x23);
      break;

   case "orangered":
      rtn.set_red(0xff).set_green(0x45).set_blue(0x00);
      break;

   case "orchid":
      rtn.set_red(0xda).set_green(0x70).set_blue(0xd6);
      break;

   case "palegoldenrod":
      rtn.set_red(0xee).set_green(0xe8).set_blue(0xaa);
      break;

   case "palegreen":
      rtn.set_red(0x98).set_green(0xfb).set_blue(0x98);
      break;

   case "paleturquoise":
      rtn.set_red(0xaf).set_green(0xee).set_blue(0xee);
      break;

   case "palevioletred":
      rtn.set_red(0xdb).set_green(0x70).set_blue(0x93);
      break;

   case "papayawhip":
      rtn.set_red(0xff).set_green(0xef).set_blue(0xd5);
      break;

   case "peachpuff":
      rtn.set_red(0xff).set_green(0xda).set_blue(0xb9);
      break;

   case "peru":
      rtn.set_red(0xcd).set_green(0x85).set_blue(0x3f);
      break;

   case "pink":
      rtn.set_red(0xff).set_green(0xc0).set_blue(0xcb);
      break;

   case "plum":
      rtn.set_red(0xdd).set_green(0xa0).set_blue(0xdd);
      break;

   case "powderblue":
      rtn.set_red(0xb0).set_green(0xe0).set_blue(0xe6);
      break;

   case "rosybrown":
      rtn.set_red(0xbc).set_green(0x8f).set_blue(0x8f);
      break;

   case "royalblue":
      rtn.set_red(0x41).set_green(0x69).set_blue(0xe1);
      break;

   case "saddlebrown":
      rtn.set_red(0x8b).set_green(0x45).set_blue(0x13);
      break;

   case "salmon":
      rtn.set_red(0xfa).set_green(0x80).set_blue(0x72);
      break;

   case "sandybrown":
      rtn.set_red(0xf4).set_green(0xa4).set_blue(0x60);
      break;

   case "seagreen":
      rtn.set_red(0x2e).set_green(0x8b).set_blue(0x57);
      break;

   case "seashell":
      rtn.set_red(0xff).set_green(0xf5).set_blue(0xee);
      break;

   case "sienna":
      rtn.set_red(0xa0).set_green(0x52).set_blue(0x2d);
      break;

   case "skyblue":
      rtn.set_red(0x87).set_green(0xce).set_blue(0xeb);
      break;

   case "slateblue":
      rtn.set_red(0x6a).set_green(0x5a).set_blue(0xcd);
      break;

   case "slategray":
   case "slategrey":
      rtn.set_red(0x70).set_green(0x80).set_blue(0x90);
      break;

   case "snow":
      rtn.set_red(0xff).set_green(0xfa).set_blue(0xfa);
      break;

   case "springgreen":
      rtn.set_red(0x00).set_green(0xff).set_blue(0x7f);
      break;

   case "steelblue":
      rtn.set_red(0x46).set_green(0x82).set_blue(0xb4);
      break;

   case "tan":
      rtn.set_red(0xd2).set_green(0xb4).set_blue(0x8c);
      break;

   case "thistle":
      rtn.set_red(0xd8).set_green(0xbf).set_blue(0xd8);
      break;

   case "tomato":
      rtn.set_red(0xff).set_green(0x63).set_blue(0x47);
      break;

   case "turquoise":
      rtn.set_red(0x40).set_green(0xe0).set_blue(0xd0);
      break;

   case "violet":
      rtn.set_red(0xee).set_green(0x82).set_blue(0xee);
      break;

   case "wheat":
      rtn.set_red(0xf5).set_green(0xde).set_blue(0xb3);
      break;

   case "whitesmoke":
      rtn.set_red(0xf5).set_green(0xf5).set_blue(0xf5);
      break;

   case "yellowgreen":
      rtn.set_red(0x9a).set_green(0xcd).set_blue(0x32);
      break;

   case "rebeccapurple":
      rtn.set_red(0x66).set_green(0x33).set_blue(0x99);
      break;

   default:
      if(colour.charAt(0) === '#')
         rtn = CsiColour.parse_hex(colour);
      else if(colour.indexOf("rgba(") === 0)
         rtn = CsiColour.parse_rgba(colour);
      else if(colour.indexOf("rgb(") === 0)
         rtn = CsiColour.parse_rgba(colour);
      break;
   }
   return rtn;
};


CsiColour.parse_hex = function(colour)
{
   var components = Number.parseInt(colour.substring(1), 16);
   var rtn = new CsiColour();
   rtn.set_red((components & 0xff0000) >> 16);
   rtn.set_green((components & 0x00ff00) >> 8);
   rtn.set_blue(components & 0x0000ff);
   return rtn;
};


CsiColour.parse_rgba = function(colour)
{
   const state_before_colour = 1;
   const state_read_r = 4;
   const state_read_g = 5;
   const state_read_b = 6;
   const state_read_a = 7;
   const state_before_red = 8;
   const state_read_red = 9;
   const state_before_green = 10;
   const state_read_green = 11;
   const state_before_blue = 12;
   const state_read_blue = 13;
   const state_before_alpha = 14;
   const state_read_alpha = 15;
   const state_end = 16;
   const state_error = 17;
   var state = state_before_colour;
   var pos = 0;
   var temp = "";
   var ch;
   var rtn = new CsiColour();
   var alpha_val;
   var do_incr;

   while(pos < colour.length && state < state_end)
   {
      do_incr = true;
      ch = colour.charAt(pos);
      if(state === state_before_colour)
      {
         if(ch === 'R' || ch === 'r')
            state = state_read_r;
         else if(ch >= '0' && ch <= '9')
         {
            temp = ch;
            state = state_error;
         }
         else if(ch == '#')
            state = state_error;
      }
      else if(state === state_read_r)
      {
         if(ch === 'g' || ch === 'G')
            state = state_read_g;
         else
            state = state_error;
      }
      else if(state === state_read_g)
      {
         if(ch === 'b' || ch === 'B')
            state = state_read_b;
         else
            state = state_error;
      }
      else if(state === state_read_b)
      {
         if(ch === 'a' || ch == 'A')
            state = state_read_a;
         else if(ch === '(')
            state = state_read_red;
         else
            state = state_error;
      }
      else if(state === state_read_a)
      {
         if(ch === '(')
            state = state_before_red;
         else
            state = state_error;
      }
      else if(state === state_before_red)
      {
         if(ch >= '0' && ch <= '9')
         {
            state = state_read_red;
            do_incr = false;
            temp = "";
         }
         else if(ch !== ' ')
            state = state_error;
      }
      else if(state == state_read_red)
      {
         if(ch >= '0' && ch <= '9')
            temp += ch;
         else if(ch === ',')
         {
            if(temp.length > 0)
            {
               rtn.set_red(Number.parseInt(temp));
               state = state_before_green;
            }
            else
               state = state_error;
         }
         else
            state = state_error;
      }
      else if(state === state_before_green)
      {
         if(ch >= '0' && ch <= '9')
         {
            state = state_read_green;
            do_incr = false;
            temp = "";
         }
         else if(ch !== ' ')
            state = state_error;
      }
      else if(state === state_read_green)
      {
         if(ch >= '0' && ch <= '9')
            temp += ch;
         else if(ch === ',')
         {
            if(temp.length > 0)
            {
               rtn.set_green(Number.parseInt(temp));
               state = state_before_blue;
            }
            else
               state = state_error;
         }
         else
            state = state_error;
      }
      else if(state === state_before_blue)
      {
         if(ch >= '0' && ch <= '9')
         {
            state = state_read_blue;
            do_incr = false;
            temp = "";
         }
         else if(ch !== ' ')
            state = state_error;
      }
      else if(state === state_read_blue)
      {
         if(ch >= '0' && ch <= '9')
            temp += ch;
         else if(ch === ')' || ch === ',')
         {
            if(temp.length > 0)
            {
               rtn.set_blue(Number.parseInt(temp));
               if(ch === ',')
                  state = state_before_alpha;
               else
                  state = state_end;
            }
            else
               state = state_error;
         }
         else
            state = state_error;
      }
      else if(state === state_before_alpha)
      {
         if((ch >= '0' && ch <= '9') || ch === '.')
         {
            state = state_read_alpha;
            do_incr = false;
            temp = "";
         }
         else if(ch !== ' ')
            state = state_error;
      }
      else if(state === state_read_alpha)
      {
         if((ch >= '0' && ch <= '9') || ch === '.')
            temp += ch;
         else if(ch === ')')
         {
            if(temp.length > 0)
            {
               alpha_val = Number.parseFloat(temp);
			   rtn.set_alpha(Math.trunc(alpha_val * 100)/100);
               if(alpha_val < 0)
                  alpha_val = 0;
               if(alpha_val > 1)
                  alpha_val = 1;               
               state = state_end;
            }
            else
               state = state_error;
            temp = "";
         }
         else
            state = state_error;
      }
      if(do_incr)
         ++pos;
   }
   if(state === state_error)
      rtn = new CsiColour();
   return rtn;
};


CsiColour.from_int = function(red, green, blue, alpha)
{
   var rtn = new CsiColour();
   if(red !== undefined)
      rtn.red = red;
   if(green !== undefined)
      rtn.green = green;
   if(blue !== undefined)
      rtn.blue = blue;
   if(alpha !== undefined)
      rtn.alpha = alpha;
   return rtn;
};


CsiColour.from_float = function(red, green, blue, alpha)
{
   var rtn = new CsiColour();
   if(red !== undefined)
   {
      if(red < 0)
         red = 0;
      if(red > 1)
         red = 1;
      rtn.red = Math.floor(red * 255);
   }
   if(green !== undefined)
   {
      if(green < 0)
         green = 0;
      if(green > 1)
         green = 1;
      rtn.green = Math.floor(green * 255);
   }
   if(blue != undefined)
   {
      if(blue < 0)
         blue = 0;
      if(blue > 1)
         blue = 1;
      rtn.blue = Math.floor(blue * 255);
   }
   if(alpha !== undefined)
   {
      if(alpha < 0)
         alpha = 0;
      if(alpha > 1)
         alpha = 1;
      rtn.alpha = Math.floor(alpha * 255);
   }
   return rtn;
};


CsiColour.prototype.get_red = function()
{
   return this.red;
};


CsiColour.prototype.set_red = function(red)
{
   this.red = red;
   return this;
};


CsiColour.prototype.get_green = function()
{
   return this.green;
};


CsiColour.prototype.set_green = function(green)
{
   this.green = green;
   return this;
};


CsiColour.prototype.get_blue = function()
{
   return this.blue;
};


CsiColour.prototype.set_blue = function(blue)
{
   this.blue = blue;
   return this;
};


CsiColour.prototype.get_alpha = function()
{
   return this.alpha;
};


CsiColour.prototype.set_alpha = function(alpha)
{
   this.alpha = alpha;
   return this;
};


CsiColour.prototype.get_transparency = function()
{
   return (255.0 - this.alpha) / 255.0;
};


CsiColour.prototype.set_transparency = function(transparency)
{
   if(transparency < 0)
      transparency = 0;
   if(transparency > 1)
      transparency = 1;
   this.alpha = Math.floor((1 - transparency) * 255);
   return this;
};


CsiColour.prototype.to_grayscale = function()
{
   var red = this.red / 255;
   var green = this.green / 255;
   var blue = this.blue / 255;
   return red * 0.21 + green * 0.71 + blue * 0.07;
};


CsiColour.prototype.background_complement = function()
{
   var grayscale = this.to_grayscale();
   var rtn = new CsiColour();
   if(grayscale < 0.5)
      rtn.set_red(0xFF).set_green(0xFF).set_blue(0xFF);
   return rtn;
};


CsiColour.prototype.format = function()
{
   var rtn = "RGBA(" + this.red + "," + this.green + "," + this.blue + "," + (this.alpha / 255) + ")";
   return rtn;
};





/* CsiComponent.js

   Copyright (C) 2010, 2016 Campbell Scientific, Inc.

   Written by: Kevin Westwood
   Date Begun: Thursday 12 August 2010
   Last Change: Friday 22 April 2016
   Last Commit: $Date: 2020-03-11 10:25:36 -0600 (Wed, 11 Mar 2020) $
   Last Changed by: $Author: b-seeley $

*/

/* global CsiColour: true */
/* global getGradient: true */


////////////////////////////////////////////////////////////
// class CsiComponent
//
// Defines a base class for all visual components
////////////////////////////////////////////////////////////
function CsiComponent(left, top, width, height)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   this.ready = true;      //Is the control ready to draw?  Could be waiting for image or other resource
   this.animating = false; //Is the control animating? (if so, draw will continually be called)
   this.needs_mouse_events = false;
   this.valid = false;
   this.drawOnlyIfInvalid = false;
   this.active = false;  //is the control active (visible on the current tab)
   this.showSelectCursor = false; //should the cursor change to a select cursor when dragging
   this.bad_data = true;
   this.nan_data = false;

   //position
   this.left = left;
   this.top = top;
   this.width = width;
   this.height = height;
   this.right = left + width;
   this.bottom = top + height;

   this.bHasBackground = false;
   this.bUseClip = false;
   this.backgroundMargin = 0;
   this.eBackgroundBorderStyle = Enum.BORDER_STYLE.NONE;

   this.eBackgroundColorStyle = Enum.BACKGROUND_STYLE.USE_GRADIENT;
   this.eBackgroundGradientDirection = Enum.GRADIENT.LinearGradientModeForwardDiagonal;
   this.backgroundGradientStartColor = "white";
   this.backgroundGradientMidColor   = "white";
   this.backgroundGradientEndColor   = "silver";
   this.backgroundGradientUseMid     = false;

   this.bBackgroundRoundedCorners = true;
   this.backgroundRoundedRadius = 5;
   this.backgroundSolidColor = "Silver";

   this.tipX = this.left + this.width + 10;
   this.tipY = this.top + 40;

   this.RotationAngle = 0;

   this.expression = null;

   this.valueSetter = null;
   this.isAlarm = false;
}

//must be implemented by each component
//draw(context) //called to draw component

//implement to support animation
//updateAnimation(), component should update animation values (only called if animating = true)

//implement to support data
//newValue(value, timestamp, expectMore)
//newNanValue(value, timestamp, expectMore)
//newRecord(jsonRecord, timestamp, expectMore)

//Optional for mouse events - just implement in needed class and set
//needs_mouse_events = true;
//
//CsiComponent.prototype.OnLButtonDblClk = function(mouseX, mouseY)
//CsiComponent.prototype.OnLButtonDown = function(mouseX, mouseY)
//CsiComponent.prototype.OnLButtonUp = function(mouseX, mouseY)
//CsiComponent.prototype.OnRButtonDown = function(mouseX, mouseY)
//CsiComponent.prototype.OnRButtonUp = function(mouseX, mouseY)

//Implement to handle when parent tab is initially shown
//CsiComponent.prototype.deactivate = function()
//CsiComponent.prototype.activate = function()

//When invalidate is called notify the CsiGraphicsManager
CsiComponent.prototype.invalidate = function ()
{
   this.valid = false;
   graphicsManager.componentInvalidate(this);
};


CsiComponent.prototype.refresh = function ()
{
   this.valid = false;
   graphicsManager.componentRefresh(this);
};


CsiComponent.prototype.getAnimating = function ()
{
   return this.animating;
};

/******************************************************************************
* drawBackground
* 
* Draw the background that appears behind each component.  It can be transparent,
* or use a solid color, or a gradient.  This will also draw a border around it.
*
******************************************************************************/
CsiComponent.prototype.drawBackground = function (context, rect)
{
   // Return if background is not to be drawn
   if (!this.bHasBackground)
   {
      return rect;
   }

   var rtnRect = new Rect(rect.left, rect.top, rect.width, rect.height);

   var borderWidth = this.getBorderWidth(this.eBackgroundBorderStyle);
   var fillZone = new Rect(rtnRect.left + borderWidth / 2, rtnRect.top + borderWidth / 2,
      rtnRect.width - borderWidth, rtnRect.height - borderWidth);

   context.save();

   switch (this.eBackgroundColorStyle)
   {
      case Enum.BACKGROUND_STYLE.USE_SOLID_COLOR:
         context.fillStyle = this.backgroundSolidColor;
         break;

      case Enum.BACKGROUND_STYLE.USE_GRADIENT:
         // For a radial gradient, we must use a transform to obtain an ellipse.
         if (this.eBackgroundGradientDirection === Enum.GRADIENT.Radial)
         {
            if (this.bBackgroundRoundedCorners)
            {
               context.fillStyle = this.backgroundGradientEndColor;
               fillRoundedRect(context, fillZone, this.backgroundRoundedRadius);
            }

            var XYRatio = fillZone.height / fillZone.width;
            if (XYRatio >= 1)
            {
               fillZone.top /= XYRatio;
               fillZone.height /= XYRatio;
               fillZone.updateBottom();
               context.transform(1, 0, 0, XYRatio, 0, 0);
            }
            else
            {
               fillZone.left *= XYRatio;
               fillZone.width *= XYRatio;
               fillZone.updateRight();
               context.transform(1.0/XYRatio, 0, 0, 1, 0, 0);          
            }
         }
         context.fillStyle = getGradient(context, fillZone, this.eBackgroundGradientDirection, this.backgroundGradientStartColor,
            this.backgroundGradientMidColor, this.backgroundGradientEndColor, this.backgroundGradientUseMid);
         break;

      case Enum.BACKGROUND_STYLE.USE_TRANSPARENT:
         break;
   }

   if (this.eBackgroundColorStyle !== Enum.BACKGROUND_STYLE.USE_TRANSPARENT)
   {
      if (this.bBackgroundRoundedCorners)
         fillRoundedRect(context, fillZone, this.backgroundRoundedRadius);
      else
         context.fillRect(fillZone.left, fillZone.top, fillZone.width, fillZone.height);
   }

   context.restore();

   this.drawBorder(context, rect, this.eBackgroundBorderStyle);

   var edgeWidth = borderWidth + this.backgroundMargin;

   rtnRect.deflate(edgeWidth, edgeWidth);

   if (rtnRect.left > rtnRect.right -4)
   {
      var centerX = rect.lef + rect.width / 2;
      rtnRect.left = centerX - 2;
      rtnRect.right = centerX + 2;
   }
   if (rtnRect.top > rtnRect.bottom - 4)
   {
      var centerY = rect.top + rect.height / 2;
      rtnRect.top = centerY - 2;
      rtnRect.bottom = centerY + 2;
   }

   return rtnRect;
};


function adjustColorDarkness(color, shift, lighten)
{
   var c = CsiColour.parse(color);
   return lighten ?
      "rgba(" + (c.red * (1 - shift) + 255 * shift) + "," + (c.green * (1 - shift) + 255 * shift) + "," + (c.blue * (1 - shift) + 255 * shift) + "," + c.alpha + ")" :
      "rgba(" + (c.red * (1 - shift) + 0 * shift)   + "," + (c.green * (1 - shift) + 0 * shift)   + "," + (c.blue * (1 - shift) + 0 * shift)   + "," + c.alpha + ")";
}

function getColorAlpha(color)
{
   var c = CsiColour.parse(color);
   return c.alpha;
}


function setColorAlpha(color, alpha)
{
   var c = CsiColour.parse(color);
   return "rgba(" + c.red + "," + c.green + "," + c.blue + "," + alpha + ")";
}



CsiComponent.prototype.getBorderWidth = function (borderstyle)
{
   switch (borderstyle)
   {
      case Enum.BORDER_STYLE.NONE:
         return 0;

      case Enum.BORDER_STYLE.LOWERED:
      case Enum.BORDER_STYLE.RAISED:
         return 5;

      case Enum.BORDER_STYLE.SINGLE:
      case Enum.BORDER_STYLE.LOWERED_BEVEL:
      case Enum.BORDER_STYLE.RAISED_BEVEL:
         return this.backgroundBorderThickness;

      default:
         csi_log("WARNING: Default case reached in getBorderWidth");
         return 0;
   }
};


function getUpperBevelGeometry(rect, borderThickness)
{
   return [
      { x: rect.left, y: rect.bottom },
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.right - borderThickness, y: rect.top + borderThickness },
      { x: rect.left + borderThickness, y: rect.top + borderThickness },
      { x: rect.left + borderThickness, y: rect.bottom - borderThickness }
   ];
}


function getLowerBevelGeometry(rect, borderThickness)
{
   return [
      { x: rect.right, y: rect.top },
      { x: rect.right, y: rect.bottom },
      { x: rect.left, y: rect.bottom },
      { x: rect.left + borderThickness, y: rect.bottom - borderThickness },
      { x: rect.right - borderThickness, y: rect.bottom - borderThickness },
      { x: rect.right - borderThickness, y: rect.top + borderThickness }
   ];
}


/******************************************************************************
* drawSquareBorder / drawRoundedBorder
* 
* Draw a border at the given rectangle with the given border style.
* drawSquareBorder draws a squared edged border, and drawRoundedBorder will have rounded corners
*
******************************************************************************/
function drawSquareBorder(context, rect, borderStyle, color, borderThickness = 0)
{
   var small_rect = new Rect(rect.left + borderThickness / 4, rect.top + borderThickness / 4,
      rect.width - borderThickness, rect.height - borderThickness);
   var large_rect = new Rect(rect.left + borderThickness / 2, rect.top + borderThickness / 2,
      rect.width - borderThickness, rect.height - borderThickness);

   var lowerGeometry = getLowerBevelGeometry(rect, borderThickness);
   var upperGeometry = getUpperBevelGeometry(rect, borderThickness);

   switch (borderStyle)
   {
      case Enum.BORDER_STYLE.NONE:
         return;

      case Enum.BORDER_STYLE.SINGLE:
         context.lineWidth = borderThickness;
         context.strokeStyle = color;
         var thisRect = new Rect(
            rect.left + borderThickness / 2.0,
            rect.top + borderThickness / 2.0,
            rect.width - borderThickness,
            rect.height - borderThickness);
         context.strokeRect(thisRect.left, thisRect.top, thisRect.width, thisRect.height);
         break;

      case Enum.BORDER_STYLE.LOWERED:
         context.lineWidth = borderThickness;
         context.strokeStyle = adjustColorDarkness(color, 0.5, true);
         context.strokeRect(large_rect.left, large_rect.top, large_rect.width, large_rect.height);
         context.lineWidth = borderThickness / 2;
         context.strokeStyle = adjustColorDarkness(color, 0.5, false);
         context.strokeRect(small_rect.left, small_rect.top, small_rect.width, small_rect.height);
         break;

      case Enum.BORDER_STYLE.RAISED:
         context.lineWidth = borderThickness;
         context.strokeStyle = adjustColorDarkness(color, 0.5, false);
         context.strokeRect(large_rect.left, large_rect.top, large_rect.width, large_rect.height);
         context.lineWidth = borderThickness / 2;
         context.strokeStyle = adjustColorDarkness(color, 0.5, true);
         context.strokeRect(small_rect.left, small_rect.top, small_rect.width, small_rect.height);
         break;

      case Enum.BORDER_STYLE.LOWERED_BEVEL:
         context.fillStyle = adjustColorDarkness(color, 0.5, false);
         fillPolygon(context, upperGeometry);
         context.fillStyle = adjustColorDarkness(color, 0.5, true);
         fillPolygon(context, lowerGeometry);
         break;

      case Enum.BORDER_STYLE.RAISED_BEVEL:
         context.fillStyle = adjustColorDarkness(color, 0.5, true);
         fillPolygon(context, upperGeometry);
         context.fillStyle = adjustColorDarkness(color, 0.5, false);
         fillPolygon(context, lowerGeometry);
         break;

      default:
         csi_log("WARNING: Default case reached in drawSquareBorder");
   }
}

function drawRoundedBorder(context, rect, borderStyle, cornerRadius, color, borderThickness = 0)
{
   var small_rect = new Rect(rect.left + borderThickness / 4, rect.top + borderThickness / 4,
      rect.width - borderThickness, rect.height - borderThickness);
   var large_rect = new Rect(rect.left + borderThickness / 2, rect.top + borderThickness / 2,
      rect.width - borderThickness, rect.height - borderThickness);

   switch (borderStyle)
   {
      case Enum.BORDER_STYLE.NONE:
         return;

      case Enum.BORDER_STYLE.SINGLE:
         context.lineWidth = borderThickness;
         context.strokeStyle = color;
         var thisRect = new Rect(
            rect.left + borderThickness / 2.0,
            rect.top + borderThickness / 2.0,
            rect.width - borderThickness,
            rect.height - borderThickness);
         drawRoundedRect(context, thisRect, cornerRadius);
         context.stroke();
         break;

      case Enum.BORDER_STYLE.LOWERED:
         context.lineWidth = borderThickness / 2;
         large_rect.top -= 1;
         large_rect.left -= 1;
         small_rect.top += 1;
         small_rect.left += 1;
         context.strokeStyle = adjustColorDarkness(color, 0.5, true);
         drawRoundedRect(context, small_rect, cornerRadius);
         context.stroke();
         context.lineWidth = borderThickness / 2;
         context.strokeStyle = adjustColorDarkness(color, 0.5, false);
         drawRoundedRect(context, large_rect, cornerRadius);
         context.stroke();
         break;

      case Enum.BORDER_STYLE.RAISED:
         context.lineWidth = borderThickness;
         context.strokeStyle = adjustColorDarkness(color, 0.5, false);
         drawRoundedRect(context, large_rect, cornerRadius);
         context.stroke();
         context.lineWidth = borderThickness / 2;
         context.strokeStyle = adjustColorDarkness(color, 0.5, true);
         drawRoundedRect(context, small_rect, cornerRadius);
         context.stroke();
         break;

      default:
         csi_log("WARNING: Default case reached in drawRoundedBorder");
   }
}


/******************************************************************************
* drawBorder
* 
* Draw the border around the component.  The color may change, based on whether
* we are setting a value or not.
*
******************************************************************************/
CsiComponent.prototype.drawBorder = function (context, rect, borderStyle)
{
   context.save();

   if (this.bBackgroundRoundedCorners && borderStyle != Enum.BORDER_STYLE.LOWERED_BEVEL && borderStyle != Enum.BORDER_STYLE.RAISED_BEVEL)
      drawRoundedBorder(context, rect, borderStyle, this.backgroundRoundedRadius, this.backgroundBorderColor, this.getBorderWidth(borderStyle));
   else
      drawSquareBorder(context, rect, borderStyle, this.backgroundBorderColor, this.getBorderWidth(borderStyle));

   if (this.valueSetter !== null)
      this.valueSetter.drawSetValueBorder(context, this.valueSetter.state, rect);

   context.restore();
};


// Copies all background props from a to b
CsiComponent.prototype.copyBackgroundProps = function (a, b)
{
   b.bHasBackground               = a.bHasBackground;
   b.bUseClip                     = a.bUseClip;
   b.backgroundMargin             = a.backgroundMargin;
   b.eBackgroundBorderStyle       = a.eBackgroundBorderStyle;
   b.backgroundBorderColor        = a.backgroundBorderColor;
   b.backgroundBorderThickness    = a.backgroundBorderThickness;
   b.eBackgroundColorStyle        = a.eBackgroundColorStyle;
   b.backgroundSolidColor         = a.backgroundSolidColor;
   b.eBackgroundGradientDirection = a.eBackgroundGradientDirection;
   b.backgroundGradientStartColor = a.backgroundGradientStartColor;
   b.backgroundGradientMidColor   = a.backgroundGradientMidColor;
   b.backgroundGradientEndColor   = a.backgroundGradientEndColor;
   b.backgroundGradientUseMid     = a.backgroundGradientUseMid;
   b.bBackgroundRoundedCorners    = a.bBackgroundRoundedCorners;
   b.backgroundRoundedRadius      = a.backgroundRoundedRadius;
};


CsiComponent.prototype.deactivate = function ()
{
   this.active = false;
};


CsiComponent.prototype.activate = function ()
{
   this.active = true;
};


function drawImageError(rect, context)
{
   context.save();

   context.translate(rect.left, rect.top);

   context.fillStyle = "white";
   context.fillRect(0, 0, rect.width, rect.height);

   //Draw image error
   context.lineWidth = 7;
   context.lineCap = "round";
   context.strokeStyle = "red";

   context.beginPath();
   context.moveTo(0, 0);
   context.lineTo(rect.width, rect.height);
   context.moveTo(rect.width, 0);
   context.lineTo(0, rect.height);
   context.stroke();

   context.restore();
}


function drawImage(context, img, rect, drawStyle = Enum.DrawStyleType.stretch)
{
   if(img) 
   {
      context.save();
      context.translate(rect.left, rect.top); //move to location

      if (drawStyle === Enum.DrawStyleType.stretch)
      {
         context.drawImage(img, 0, 0, rect.width, rect.height);
      }
      else if (drawStyle === Enum.DrawStyleType.tile)
      {
         var currLeft = 0;
         while (currLeft <= rect.width)
         {
            var currTop = 0;
            while (currTop <= rect.height)
            {
               context.drawImage(img, currLeft, currTop);
               currTop += img.height;
            }
            currLeft += img.width;
         }
      }
      else if (drawStyle === Enum.DrawStyleType.center)
      {
         context.drawImage(img, (rect.width - img.width) / 2.0,
            (rect.height - img.height) / 2.0);
      }
      else //Enum.DrawStyleType.best_fit
      {
         var im_w = img.width;
         var im_h = img.height;
         var comp_w = rect.width;
         var comp_h = rect.height;
         var image_aspect_ratio = 0;
         //Scale the image
         if (im_w < im_h)
         {
            image_aspect_ratio = im_w / im_h;
            im_h = comp_h;
            im_w = im_h * image_aspect_ratio;

            if (im_w > comp_w) //Keep the image inside the comp bounds
            {
               im_w = comp_w;
               im_h = im_w / image_aspect_ratio;
            }
         }
         else
         {
            image_aspect_ratio = im_h / im_w;
            im_w = comp_w;
            im_h = im_w * image_aspect_ratio;

            if (im_h > comp_h) //Keep the image inside the comp bounds
            {
               im_h = comp_h;
               im_w = im_h / image_aspect_ratio;
            }
         }
         var im_x = (rect.width / 2) - (im_w / 2);
         var im_y = (rect.height / 2) - (im_h / 2);
         context.drawImage(img, im_x, im_y, im_w, im_h);
      }
      context.restore();
   }
}




CsiComponent.prototype.drawImageError = function (context)
{
   drawImageError(new Rect(this.left, this.top, this.width, this.height), context);
};


/**
 * @return Returns true if this component is on the screen that is currently visible
 * or if none of the currently visible screen's components have bad_data flags.
 */
CsiComponent.prototype.needs_data_now = function()
{
   return graphicsManager.component_needs_data(this);
};


function drawSingleLineBorder(context, rect, borderStyle)
{
   if(borderStyle !== Enum.BORDER_STYLE.NONE)
   {
      if(borderStyle === Enum.BORDER_STYLE.RAISED)
      {
         context.beginPath();
         context.strokeStyle = "white";
         context.moveTo(rect.left, rect.bottom);
         context.lineTo(rect.left, rect.top); //left line
         context.lineTo(rect.right, rect.top); //top line
         context.stroke();

         context.beginPath();
         context.strokeStyle = "black";
         context.moveTo(rect.right, rect.top);
         context.lineTo(rect.right, rect.bottom); //right line
         context.lineTo(rect.left + 1, rect.bottom); //bottom line
         context.stroke();
      }
      else if(borderStyle === Enum.BORDER_STYLE.LOWERED)
      {
         context.beginPath();
         context.strokeStyle = "black";
         context.moveTo(rect.left, rect.bottom);
         context.lineTo(rect.left, rect.top); //left line
         context.lineTo(rect.right, rect.top); //top line
         context.stroke();

         context.beginPath();
         context.strokeStyle = "white";
         context.moveTo(rect.right, rect.top);
         context.lineTo(rect.right, rect.bottom); //right line
         context.lineTo(rect.left, rect.bottom); //bottom line
         context.stroke();
      }
      else //Single
      {
         context.beginPath();
         context.strokeStyle = "black";
         context.moveTo(rect.left, rect.bottom);
         context.lineTo(rect.left, rect.top); //left line
         context.lineTo(rect.right, rect.top); //top line
         context.lineTo(rect.right, rect.bottom); //right line
         context.lineTo(rect.left, rect.bottom); //bottom line
         context.stroke();
      }
   }
}


function drawStyledBorder(context, rect, styleOrColor, width)
{
   var tempRect = new Rect(rect.left, rect.top, rect.width, rect.height);
   tempRect.adjustForLines();

   context.save();
   context.beginPath();
   context.strokeStyle = styleOrColor;
   context.lineWidth = width;
   context.moveTo(tempRect.left, tempRect.bottom);
   context.lineTo(tempRect.left, tempRect.top); //left line
   context.lineTo(tempRect.right, tempRect.top); //top line
   context.lineTo(tempRect.right, tempRect.bottom); //right line
   context.lineTo(tempRect.left, tempRect.bottom); //bottom line
   context.stroke();
   context.restore();
}

function fillRoundedRect(context, rect, cornerRadius)
{
   drawRoundedRect(context, rect, cornerRadius);
   context.fill();
}

function drawRoundedRect(context, rect, cornerRadius)
{
   context.beginPath();

   //Don't let the corners stick out of the rectangle.
   var radiusH = cornerRadius;
   var radiusW = cornerRadius;
   if(rect.height < (radiusH * 2.0))
   {
      radiusH = rect.height / 2.0;
   }

   if(rect.width < (radiusW * 2.0))
   {
      radiusW = rect.width / 2.0;
   }

   //Top Left Corner
   context.moveTo(rect.left + radiusW, rect.top);
   context.quadraticCurveTo(rect.left, rect.top, rect.left, rect.top + radiusH);
   //Left Line
   context.lineTo(rect.left, rect.bottom - radiusH);
   //Bottom Left Line
   context.quadraticCurveTo(rect.left, rect.bottom, rect.left + radiusW, rect.bottom);
   //Bottom Line
   context.lineTo(rect.right - radiusW, rect.bottom);
   //Bottom Right Line
   context.quadraticCurveTo(rect.right, rect.bottom, rect.right, rect.bottom - radiusH);
   //Right Line
   context.lineTo(rect.right, rect.top + radiusH);
   //Top Right Corner
   context.quadraticCurveTo(rect.right, rect.top, rect.right - radiusW, rect.top);
   //Top line
   context.closePath();
}


function fillPolygon(context, points)
{
   if (points.length === 0)
      return;

   context.beginPath();
   context.moveTo(points[0].x, points[0].y);
   for(let i = 1; i < points.length; i++)
   {
      context.lineTo(points[i].x, points[i].y);
   }
   context.closePath();
   context.fill();
}

function clipRect(context, x, y, width, height)
{
   context.beginPath();
   context.moveTo(x, y);
   context.lineTo(x + width, y);
   context.lineTo(x + width, y + height);
   context.lineTo(x, y + height);
   context.clip();
}


CsiComponent.prototype.getBadData = function ()
{
   return this.bad_data;
};


CsiComponent.prototype.getNanData = function ()
{
   return this.nan_data;
};


CsiComponent.prototype.reset_data = function ()
{
   this.bad_data = true;
   this.nan_data = false;
};


CsiComponent.prototype.on_touch_start = function (event)
{ return false; };


CsiComponent.prototype.on_touch_move = function (event)
{ return false; };


CsiComponent.prototype.on_touch_end = function (event)
{ return false; };


CsiComponent.prototype.OnMouseExit = function ()
{
   if(this.IncludeHoverCaption)
   {
      oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
      oneShotTimer.clearTimeout(this, "ShowTooltip_Remove");
      $("#tooltip_div").remove();
   }
   document.body.style.cursor = "default";
   return true; //Prevent default behavior
};


CsiComponent.prototype.OnMouseMove = function (mouseX, mouseY)
{
   if(this.IncludeHoverCaption)
   {
      oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
      // Base the tip position off of the hotspot rectangle
      //this.tipX = mouseX + 5;
      //this.tipY = mouseY + 15;
      oneShotTimer.setTimeout(this, "ShowTooltip_Add", 1000); //Show if mouse hovers for 1 sec
   }
   return true; //Prevent default behavior
};


CsiComponent.prototype.onOneShotTimer = function (tag)
{
   if(tag === "ShowTooltip_Add")
   {
      $("#tooltip_div").remove(); //Fresh start

      var $tip = $('<div />', {
         id: 'tooltip_div',
      });
      $tip.html(this.HoverCaption);
      $tip.css({
         display: 'none', top: this.tipY, left: this.tipX, position: 'absolute', border: '1px solid black', color: 'black',
         'background-color': '#FFFFE1', padding: '4px', 'border-radius': '0px', 'z-index': '9', 'font-size' : '12pt', 'font-weight' : '500'
      });
      $tip.appendTo($('#canvas_container'));
      $tip.fadeIn("slow");
   }
   else if(tag === "ShowTooltip_Remove")
   {
      $("#tooltip_div").hide();
      $("#tooltip_div").remove();
   }
};


function drawNanData(comp, context)
{
   return;
}


function drawBadData(comp, context)
{
   return;
}

/* CsiAlarm.js

   Copyright (C) 2012, 2019 Campbell Scientific, Inc.

   Written by: Kevin Westwood 
   Date Begun: 5 October 2010

*/

/* global canvasOffsetX: true */
/* global canvasOffsetY: true */

function CsiAlarm(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   this.lastValue = 0.0;
   this.lastTimestamp = null;
   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
   }

   this.alarmStates = [];
   this.stateToDraw = null;
   this.ready = true;
   this.alarm_acknowledged = false;
   this.needs_mouse_events = false;
   this.firstData = true;
   this.identifier = null;
   this.alarm_text_description = null;
   this.alarm_data = null;
   this.isAlarm = true;
   
   //make sure we are all ready (images, sounds, etc loaded by all alarm type classes)
   oneShotTimer.setTimeout(this, "CheckAllReady", 500);
}
CsiAlarm.prototype = new CsiComponent();


CsiAlarm.prototype.set_identifier = function(identifier)
{
   if(theAlarmsManager)
   {
      this.identifier = identifier;
      theAlarmsManager.add_alarm(this, this.identifier);
   }
};


CsiAlarm.prototype.hasActiveAlarm = function ()
{
   var rtn = false;
   var len = this.alarmStates.length;
   var i;
   for(i = 1; i < len && !rtn; i++)
   {
      if(this.alarmStates[i].show_alarm && !this.alarm_acknowledged)
      {
         rtn = true;
      }
      if (this.lastValueIsBad()) {
         rtn = true;  // Show the alarm flag when NAN or INF
      }
   }

   this.needs_mouse_events = rtn; //If we aren't in an alarm state, we don't need the mouse events

   return rtn;
};


CsiAlarm.prototype.newStringValue = function (value, timestamp, expect_more)
{
   this.newValue(value, timestamp, expect_more);
};


CsiAlarm.prototype.newValue = function (value, timestamp, expect_more)
{
   this.lastValue = value;
   this.lastTimestamp = timestamp;
   this.evaluateValue(value, timestamp);
   this.firstData = false;
};

CsiAlarm.prototype.newNanValue = function (value, timestamp, expect_more) {
   if (value !== this.last_value) {
      var stringValue;
      if (value === -Infinity) {
         stringValue = "-INF";
      }
      else if (value === Infinity) {
         stringValue = "INF";
      }
      else {
         stringValue = "NAN";
      }
      this.lastValue = stringValue;
      this.lastTimestamp = timestamp;
      graphicsManager.update_alarm_tabs();
   }      
};

CsiAlarm.prototype.lastValueIsBad = function () {
   switch (this.lastValue) {
      case "-INF":
      case "INF":
      case "NAN": {
         return true;
      }
   }
   return false;
};

CsiAlarm.prototype.on_alarm_data = function (alarm_data) {
   this.alarm_data = alarm_data;
   this.lastValue = alarm_data.value;

   if (this.bad_data) {
      this.bad_data = false;
      this.newNanValue(alarm_data.value);
      this.invalidate();
   } else {
      if (this.nan_data) { // was NAN
         this.nan_data = false;
      }
   }
  
   var prev_acked = this.alarm_acknowledged;
   this.alarm_acknowledged = (alarm_data.state === "acknowledged");

   var i;
   var len = this.alarmStates.length;

   //Find the current alarming state
   var prev_state = this.alarmStates[0];
   for (i = 1; i < len; i++)
   {
      if (this.alarmStates[i].show_alarm)
      {
         prev_state = this.alarmStates[i];
         break;
      }
   }

   //Check to see if there is a new state
   this.stateToDraw = this.alarmStates[0];
   for(i = 1; i < len; i++)
   {
      //Iterate through all of the states and then just set the rest to no alarm state
      let alarmState = this.alarmStates[i];

      if(alarm_data.triggered_condition_name === alarmState.stateName)
      {
         this.stateToDraw = alarmState;
         this.set_show_alarm(alarmState, true);
      }
      else
      {
         this.set_show_alarm(alarmState, false);
      }
   }

   this.copyBackgroundProps(this.stateToDraw, this);


   if (prev_state !== this.stateToDraw || prev_acked !== this.alarm_acknowledged)
   {
      if (this.stateToDraw)
      {
         if(this.alarm_acknowledged)
         {
            this.stateToDraw.stopAudio();
         }
         else
         {
            this.stateToDraw.playAudio();
         }
      }
      graphicsManager.update_alarm_tabs();
      this.invalidate();
   }

   if (this.lastValueIsBad()) {
      graphicsManager.update_alarm_tabs();
      this.invalidate();
   }
};


CsiAlarm.prototype.on_alarms_poll_failed = function(status, error)
{
   this.bad_data = true;
   this.invalidate();
};


CsiAlarm.prototype.evaluateValue = function (value, timestamp)
{
   const len = this.alarmStates.length;
   const prev_state = this.stateToDraw;
   this.stateToDraw = null;

   //Check to see if there is a new state
   for(let i = 1; i < len; i++)
   {
      //Iterate through all of the states and then just set the rest to no alarm state
      let alarmState = this.alarmStates[i];
      if (this.stateToDraw === null)
      {
         alarmState.evaluate_condition(value, timestamp);
         if(alarmState.show_alarm)
         {
            this.stateToDraw = alarmState;
         }
      }
      else
      {
         // A previous state was set to true, so all other alarm states must be false.
         this.set_show_alarm(alarmState, false);
      }
   }

   if (this.stateToDraw === null)
   {
      this.stateToDraw = this.alarmStates[0];
      this.set_show_alarm(this.stateToDraw, true);
   }

   if (prev_state !== this.stateToDraw || this.firstData)
   {
      this.copyBackgroundProps(this.stateToDraw, this);

      graphicsManager.update_alarm_tabs();
      this.alarm_acknowledged = false;
      this.invalidate();
   }
};


CsiAlarm.prototype.newRecord = function (jsonRecord, timestamp, expect_more)
{
   this.lastValue = 0.0;
   this.lastTimestamp = timestamp;

   const requiresInvalidate = this.firstData;
   this.firstData = false;

   const prevStateToDraw = this.stateToDraw;

   const len = this.alarmStates.length;
   this.stateToDraw = this.alarmStates[0];
   for(let i = 1; i < len; i++)
   {
      let alarmState = this.alarmStates[i];

      alarmState.evaluate_condition(this.lastValue, timestamp);

      if (alarmState.show_alarm)
         this.stateToDraw = alarmState;
   }

   if (requiresInvalidate || this.stateToDraw !== prevStateToDraw)
   {
      this.copyBackgroundProps(this.stateToDraw, this);
      this.alarm_acknowledged = false;
      this.invalidate();
   }
};


CsiAlarm.prototype.getShowAlarm = function ()
{
   var i;
   var len = this.alarmStates.length;
   for(i = 0; i < len; i++)
   {
      if(this.alarmStates[i].show_alarm)
      {
         return true;
      }
   }

   return false;
};


CsiAlarm.prototype.deactivate = function ()
{
   CsiComponent.prototype.deactivate.call(this);
   csiMouseEvents.hideMenu();
};


//left mouse button click.  We want to show the acknowledge alarm menu item with a left button click because
//the handheld touch screens do not distinguish between a left and right button click
CsiAlarm.prototype.OnLButtonClick = function (mouseX, mouseY)
{
   this.OnRButtonClick(mouseX, mouseY);
};


//right mouse button click.  Show popup "Acknowledge Alarm" menu item
CsiAlarm.prototype.OnRButtonClick = function (mouseX, mouseY)
{
   if((this.getShowAlarm()) && (!this.alarm_acknowledged))
   {
      var component = this;
      csiMouseEvents.hideMenu();

      $("<div id='context'></div>").html("<ul class='context_menu'><li id='acknowledge' class='menu_item'>Acknowledge Alarm</li></ul>")
      .css({
         position: 'absolute',
         zIndex: '9999',
         left: mouseX + canvasOffsetX,
         top: mouseY + canvasOffsetY
      }).show().appendTo('body');

      $('ul.context_menu').css({
         listStyle: 'none',
         padding: '1px',
         margin: '0px',
         backgroundColor: '#fff',
         border: '1px solid #999',
         width: 'auto'
      });

      $('li.menu_item').mouseover(function ()
      {
         $(this).css({
            backgroundColor: '#E9EFF8'
         });
      }).mouseout(function ()
      {
         $(this).css({
            backgroundColor: 'transparent'
         });
      }).css({
         width: 'auto',
         margin: '0px',
         color: '#000',
         display: 'block',
         cursor: 'default',
         padding: '3px',
         border: '1px solid #fff',
         backgroundColor: 'transparent'
      }).click(function ()
      {
         csiMouseEvents.hideMenu();
      });

      $('#acknowledge').click(function ()
      {
         component.do_acknowledge();
      });
   }
};


CsiAlarm.prototype.do_acknowledge = function()
{
   var comments = null;
   if(this.alarm_text_description)
   {
      // format the HTML for the dialog
      var comment_html = "<form id='alarm_comment_form'>" + this.alarm_text_description +
            " <input type='text' id='alarm_comment_input' /></form>";

      // we need to make sure that the dialog div has not already been created
      var dialog_div;
      var component = this;
      $("#dialog_div").remove();
      dialog_div = $("<div id='dialog_div'></div>").html(comment_html);
      dialog_div.dialog({
         autoOpen: false,
         title: "Acknowledge Alarm",
         open: function() {
            $(document).keypress(function (e) {
               if((e.which && e.which === 13) || e.keyCode && e.keyCode === 13)
               {
                  if(dialog_div.dialog('isOpen'))
                  {
                     e.preventDefault();
                     $('.ui-dialog-buttonset > button:first').trigger('click');
                  }
               }
            });
         },
         close: function() { $(document).unbind('keypress'); },
         buttons: {
            "Ok": function() {
               var input = $("#alarm_comment_input")[0];
               $(this).dialog("close");
               if(input)
               {
                  component.acknowledgeAlarm(input.value);
               }
            },
            "Cancel": function() {
               $(this).dialog("close");
            }
         },
         closeOnEscape: true,
         draggable: true,
         modal: true,
         resizable: false,
         position: [0, 0]
      });
      dialog_div.dialog("open");
   }
   else
   {
      this.acknowledgeAlarm(comments);
   }
};


CsiAlarm.prototype.acknowledgeAlarm = function (comments)
{
   if(this.identifier)
   {
      var component = this;
      var ack_url = ".?command=CheckAlarm&format=json&name=" + encodeURIComponent(component.identifier) + "&acknowledge=true";
      if(comments && comments.length)
      {
         ack_url = ack_url + "&acknowledge_comments=" + encodeURIComponent(comments);
      }
      $.ajax({
         url: ack_url,
         dataType: "json",
         cache: false,
         success: function (json, status, xhr)
         {
            var alarmState;
            component.alarm_acknowledged = (json.state === "acknowledged");
            component.stateToDraw = component.alarmStates[0];
            var len = component.alarmStates.length;
            var i;
            for(i = 1; i < len; i++)
            {
               //Iterate through all of the states and then just set the rest to no alarm state
               alarmState = component.alarmStates[i];

               if(json.triggered_condition_name === alarmState.stateName)
               {
                  component.stateToDraw = alarmState;
                  component.set_show_alarm(alarmState, true);
               }
               else
               {
                  component.set_show_alarm(alarmState, false);
               }
            }
            component.copyBackgroundProps(component.stateToDraw, component);
            
            component.stopAudio();
            component.invalidate();
            graphicsManager.update_alarm_tabs();
         },
         error: function (xhr, status, error)
         {
            component.alarm_acknowledged = false;
            component.invalidate();
            graphicsManager.update_alarm_tabs();
         }
      });
   }
   else
   {
      this.alarm_acknowledged = true;
      this.stopAudio();
      this.evaluateValue(this.lastValue, this.lastTimestamp); //we must evaluate the last value if it was latched
      graphicsManager.update_alarm_tabs();
      this.invalidate();
   }
};


CsiAlarm.prototype.stopAudio = function ()
{
   //stop all audio alarms
   var i;
   var len = this.alarmStates.length;
   for(i = 0; i < len; i++)
   {
      if(this.alarmStates[i].show_alarm)
      {
         this.alarmStates[i].stopAudio();
      }
   }
};


CsiAlarm.prototype.drawAlarmAcknowledged = function (context, rect)
{
   if(this.alarm_acknowledged)
   {

      let lineWidth = rect.width < rect.height ? rect.width : rect.height;
      lineWidth *= 0.1;
      if (lineWidth < 3) 
         lineWidth = 3;


      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.strokeStyle = "RGBA(128, 128, 128, 0.35)";
      context.beginPath();

      //The context should already be translated to the top-left corner of the alarm
      context.moveTo(rect.left  + lineWidth, rect.top    + lineWidth);
      context.lineTo(rect.right - lineWidth, rect.bottom - lineWidth);
      context.moveTo(rect.right - lineWidth, rect.top    + lineWidth);
      context.lineTo(rect.left  + lineWidth, rect.bottom - lineWidth);
      context.stroke();
   }
};


CsiAlarm.prototype.reset_data = function (reset_settings)
{
   this.bad_data = true;
   const len = this.alarmStates.length;
   for (let i = 0; i < len; i++)
   {
      this.set_show_alarm(this.alarmStates[i], false);
      this.alarmStates[i].stopAudio();
   }
   this.stateToDraw = this.alarmStates[0];
   this.copyBackgroundProps(this.stateToDraw, this); 
};


CsiAlarm.prototype.check_all_ready = function ()
{
   if(this.ready) //Don't do anything if we are already ready
   {
      return;
   }

   var still_loading = false;
   var len = this.alarmStates.length;
   var i;
   for(i = 0; i < len && !still_loading; i++)
   {
      if(this.alarmStates[i].check_still_loading())
      {
         still_loading = true;
      }
   }

   if(!still_loading)
   {
      this.ready = true;
   }

   if(this.ready)
   {
      this.invalidate();
   }
};


CsiAlarm.prototype.onOneShotTimer = function (tag)
{
   if(tag === "CheckAllReady")
   {
      if(!this.ready)
      {
         //Check to see if we are ready yet
         this.check_all_ready();

         if(!this.ready)
         {
            //Still not ready, so check again in a second
            oneShotTimer.setTimeout(this, "CheckAllReady", 500);
         }
      }
   }
   else {
      CsiComponent.prototype.onOneShotTimer.call(this, tag);
   }
};

CsiAlarm.prototype.set_show_alarm = function (alarmState, show_alarm)
{
   alarmState.show_alarm = show_alarm;
};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiImageAlarmState.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiAlarmState: true */
/* global adjustFontForRect */
/* global getFontSize */
/* global setFontSize */
/* global drawTextWithDecorations */
/* global setFontFamily */
/* global drawImage */
/* global CsiImage */



function CsiImageAlarmState(ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   this.ownerAlarm = ownerAlarm;

   CsiAlarmState.call(this, ownerAlarm, wavFilename, mp3Filename, oggFilename);

   this.alarmImg = new Image();
   this.alarmImg.owner = this;
   this.alarmImg.loaded = false;
   this.alarmImg.onload = CsiImageAlarmState.prototype.alarmImg_onload;
   this.alarmImg.onerror = CsiImageAlarmState.prototype.alarmImg_onerror;
   this.alarmImg.onabort = CsiImageAlarmState.prototype.alarmImg_onerror;
   this.alarmImg.src = imageFilename;
}
CsiImageAlarmState.prototype = new CsiAlarmState();


CsiImageAlarmState.prototype.alarmImg_onload = function ()
{
   this.loaded = true;
   this.owner.ownerAlarm.check_all_ready();
};


CsiImageAlarmState.prototype.alarmImg_onerror = function ()
{
   var owner = this.owner;
   owner.alarmImg = null;
   owner.ownerAlarm.check_all_ready();
};


CsiImageAlarmState.prototype.check_still_loading = function ()
{
   var still_loading = CsiAlarmState.prototype.check_still_loading.call(this);

   if(!still_loading && this.alarmImg)
   {
      if(!this.alarmImg.loaded)
      {
         still_loading = true;
      }
   }

   return still_loading;
};


CsiImageAlarmState.prototype.drawEllipse = function (context, rect, color, width)
{
   context.save();
   context.beginPath();
   context.strokeStyle = color;
   context.lineWidth = width;
   context.ellipse(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
   context.stroke();
   context.restore();
};

CsiImageAlarmState.prototype.drawStandardImage = function (context, rect)
{
   if (rect.width < 20 || rect.height < 20)
      return;

   let origColor = this.standardColor;
   if (this.show_alarm && this.ownerAlarm.alarm_acknowledged) {
      this.standardColor = this.acknowledgedStandardColor;
   }
   this.draw_bubble(context, rect);
   this.draw_base(context, rect);
   this.draw_led(context, rect);

   this.standardColor = origColor;
};

CsiImageAlarmState.prototype.draw_bubble = function (context, rect)
{
   context.save();

   var bubble_rect = new Rect(rect.left, rect.top + rect.height * 5 / 6 - rect.height * 0.825, rect.width, rect.height * 1.65);

   var XYRatio = bubble_rect.height / bubble_rect.width;
   var centerX = bubble_rect.left + bubble_rect.width / 2;
   var centerY = (bubble_rect.top + bubble_rect.height / 2) / XYRatio;
   var gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, bubble_rect.width);

   gradient.addColorStop(0.1, this.standardColor);
   gradient.addColorStop(1.0, "white");

   context.beginPath();
   context.transform(1, 0, 0, XYRatio, 0, 0);
   context.fillStyle = gradient;
   context.ellipse(centerX, centerY, bubble_rect.width / 2, bubble_rect.height / 2 / XYRatio, 0, 0, Math.PI, true);
   context.fill();

   context.restore();
};

CsiImageAlarmState.prototype.draw_base = function (context, rect)
{
   context.save();

   context.translate(rect.left, rect.top);
   var base_rect = new Rect(0, rect.height * 2 / 3 - 2, rect.width, rect.height / 3 - 2);

   this.drawEllipse(context, base_rect, "black", 2);

   base_rect.top -= 1;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "#808080", 4);

   base_rect.top -= 4;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "black", 4);

   base_rect.top -= 4;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "#D3D3D3", 4);

   base_rect.top -= 1;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "#A9A9A9", 1);

   base_rect.top -= 4;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "#D3D3D3", 4);

   base_rect.top -= 1;
   base_rect.updateBottom();
   this.drawEllipse(context, base_rect, "#A9A9A9", 1);

   base_rect.top += 5;
   base_rect.updateWidth();

   context.beginPath();
   context.fillStyle = this.standardColor;
   context.ellipse(base_rect.left + base_rect.width / 2, base_rect.top + base_rect.height / 2, base_rect.width / 2, base_rect.height / 2, 0, 0, Math.PI * 2);
   context.fill();
   context.beginPath();
   context.fillStyle = "white";
   context.globalAlpha = 0.15;
   context.ellipse(base_rect.left + base_rect.width / 2, base_rect.top + base_rect.height / 2, base_rect.width / 2, base_rect.height / 2, 0, 0, Math.PI * 2);
   context.fill();

   context.restore();
};

CsiImageAlarmState.prototype.draw_led = function (context, rect)
{
   context.save();
   context.translate(rect.left, rect.top);

   var led_rect = new Rect(rect.width * 3 / 8, rect.height * 3 / 10, rect.width / 4, rect.height / 2);

   context.save();
   context.fillStyle = this.standardColor;
   this.draw_led_outline(context, led_rect);
   context.restore();

   led_rect = new Rect(led_rect.left + led_rect.width / 20, led_rect.top + led_rect.height / 20, led_rect.width * 9 / 10, led_rect.height * 9 / 10);

   var bulb_left_gradient = context.createLinearGradient(led_rect.left, led_rect.top, led_rect.right, led_rect.top);
   bulb_left_gradient.addColorStop(0.0, "white");
   bulb_left_gradient.addColorStop(0.15, this.standardColor);
   bulb_left_gradient.addColorStop(1.0, this.standardColor);
   
   context.save();
   context.fillStyle = bulb_left_gradient;
   this.draw_led_outline(context, led_rect);
   context.restore();

   var circ_rect_width = led_rect.width / 2;
   var circ_rect_height = led_rect.height * 2 / 5;
   var XYRatio = circ_rect_height / circ_rect_width;

   var circ_rect = new Rect(led_rect.left + led_rect.width / 4, led_rect.top, circ_rect_width, circ_rect_height / XYRatio);

   var circ_gradient = context.createRadialGradient(circ_rect.width / 2, circ_rect.height / 2, circ_rect.width / 2, circ_rect.width / 2, 0, 0);
   circ_gradient.addColorStop(0.0, this.standardColor);
   circ_gradient.addColorStop(1.0, "white");

   context.transform(1, 0, 0, XYRatio, circ_rect.left, circ_rect.top);

   context.beginPath();
   context.fillStyle = circ_gradient;
   context.globalAlpha = 0.5;
   context.ellipse(circ_rect.width / 2, circ_rect.height / 2, circ_rect.width / 2, circ_rect.height / 2, 0, 0, Math.PI * 2);
   context.fill();
   
   context.restore();
};

CsiImageAlarmState.prototype.draw_led_outline = function (context, led_rect)
{
   context.beginPath();
   context.ellipse(led_rect.left + led_rect.width / 2, led_rect.top + led_rect.height / 2, led_rect.width / 2, led_rect.height / 2, 0, 0, Math.PI * 2);
   context.fill();
   context.beginPath();
   context.rect(led_rect.left, led_rect.top + led_rect.height / 2, led_rect.width, led_rect.height / 4);
   context.fill();
   drawRoundedRect(context, new Rect(led_rect.left, led_rect.top + led_rect.height / 2, led_rect.width, led_rect.height / 2), 8);
   context.fill();
};

/****************************************************************************************
 * CsiImageAlarmState::drawImage
 *
 * Draw the image for this state
 ****************************************************************************************/

CsiImageAlarmState.prototype.drawImage = function (context, rect)
{
   var rectImage = new Rect(rect.left, rect.top, rect.width, rect.height);

   if (this.bCenterImage && this.imageSize < 100)
   {
      const diffCx = rectImage.width  * (1 - (this.imageSize / 100));
      const diffCy = rectImage.height * (1 - (this.imageSize / 100));
      rectImage.left   += diffCx / 2;
      rectImage.top    += diffCy / 2;
      rectImage.width  -= diffCx;
      rectImage.height -= diffCy;
   }
   else if (!this.bCenterImage && this.bIncludeText && this.textTextBaseline !== "middle")
   {
      let textFont = adjustFontForRect(context, this.textFont, this.textStr, rectImage.width, rectImage.height, 3);
      let origFont = context.font;
      textFont = setFontFamily(textFont, "Arial");
      context.font = textFont;
      let textHeight = context.measureText("W").width; //assume height("W") == width("W");
      context.font = origFont;

      if (this.textTextBaseline === "top")
      {
         rectImage.top += textHeight + 3;
      }
      else
      {
         rectImage.bottom -= textHeight + 5;
      }
      rectImage.height = rectImage.bottom - rectImage.top;
   }
 
   switch (this.eImageType) {
      case Enum.ALARM_TYPE.LOCAL_IMAGE:
      case Enum.ALARM_TYPE.URL_IMAGE:
         if (this.alarmImg) {
            drawImage(context, this.alarmImg, rectImage, this.ownerAlarm.ImageStretch );
         }
         else {
            drawImageError(rectImage, context);
         }
         break;
      case Enum.ALARM_TYPE.STANDARD_DRAW:
         this.drawStandardImage(context, rectImage);
         break;
   }
};

/****************************************************************************************
 * CsiImageAlarmState::drawText
 *
 * Draw the text and numeric portion of the alarm, if necessary
 ****************************************************************************************/

CsiImageAlarmState.prototype.drawText = function (context, rect, alarm_data = null, last_value = null)
{
   //--------------------------------------------------------------------
   // First, figure out the numeric portion that needs to be drawn, if necessary
   //--------------------------------------------------------------------
   var numericText = "";

   if (this.bIncludeNumeric)
   {
      if (alarm_data !== null) {
         numericText = alarm_data.value;
         if (alarm_data.value_type === "xsd:string") {
            numericText = alarm_data.value;
         }
         else if (alarm_data.value_type === "xsd:boolean") {
            if (alarm_data.value_type) {
               numericText = this.alarm_data.value;
            }
         }
         else //xsd:double
         {
            if (isNaN(alarm_data.value)) {            
               numericText = alarm_data.value;
            } else {
               numericText = Number(alarm_data.value).toFixed(this.numericPrecision);
            }
         }
      }
      else if (last_value !== null) {
         if (isNaN(last_value)) {
            numericText = last_value;
         } else {
            numericText = Number(last_value).toFixed(this.numericPrecision);
         }
      }
      else {
         numericText = "?";
      }

      if (this.bNumericUnitsSameFont && this.numericUnitStr !== "") {
         numericText = numericText + " " + this.numericUnitStr;
      }
   }

   //--------------------------------------------------------------------
   // Now, calculate the fonts and locations of the text.  This will vary 
   // depending on if all text will fit inside the component.
   //--------------------------------------------------------------------
   var textFont = this.textFont;
   var numericFont = this.numericFont;
   var unitFont = this.numericUnitFont;

   context.font = textFont;
   var txtSize = measureText(context, this.textStr, this.textFontDecoration);

   context.font = numericFont;
   var numericSize = measureText(context, numericText, this.numericFontDecoration);

   context.font = unitFont;
   var unitSize = measureText(context, this.numericUnitStr, this.numericUnitFontDecoration);

   var targetText = new Rect(rect.left, rect.top, rect.width, rect.height);
   var targetNumeric = new Rect(rect.left, rect.top, rect.width, rect.height);
   var targetUnits = new Rect(rect.left, rect.top, rect.width, rect.height);

   var ratioNumeric = 1;
   if (!this.bNumericUnitsSameFont)
      ratioNumeric = numericSize.width / (numericSize.width + unitSize.width);

   if (this.bIncludeText && this.bIncludeNumeric /*&& !this.bNumericUnitsSameFont*/) {
      //--------------------------------------------------
      // Calculate the target sizes
      //--------------------------------------------------
      var largerNumericHeight = numericSize.height;
      if (unitSize.height > largerNumericHeight && !this.bNumericUnitsSameFont)
         largerNumericHeight = unitSize.height;

      var ratioText = txtSize.height / (txtSize.height + largerNumericHeight);

      // Allow space between text and numeric portion
      targetText.height = targetNumeric.height = targetUnits.height = rect.height - 5;
      if (!this.bNumericUnitsSameFont)
         targetNumeric.width = targetUnits.width = rect.width - 5;

      targetNumeric.width = ratioNumeric * targetNumeric.width;
      targetUnits.width = (1 - ratioNumeric) * targetUnits.width;

      targetText.height = ratioText * targetText.height;
      targetNumeric.height = targetUnits.height = (1 - ratioText) * targetNumeric.height;

      //--------------------------------------------------
      // Adjust the fonts
      //--------------------------------------------------
      var fontSize1 = getFontSize(textFont);
      var fontSize2 = getFontSize(numericFont);
      var fontSize3 = getFontSize(unitFont);

      textFont = adjustFontForRect(context, textFont, this.textStr, targetText.width, targetText.height, 3);
      var fontSize1b = getFontSize(textFont);
      if (fontSize1b < fontSize1)
      {
         fontSize2 *= fontSize1b / fontSize1;
         fontSize3 *= fontSize1b / fontSize1;
         fontSize1 = fontSize1b;

         numericFont = setFontSize(numericFont, fontSize2);
         unitFont = setFontSize(unitFont, fontSize3);
      }

      numericFont = adjustFontForRect(context, numericFont, numericText, targetNumeric.width, targetNumeric.height, 3);
      var fontSize2b = getFontSize(textFont);
      if (fontSize2b < fontSize2)
      {
         fontSize1 *= fontSize2b / fontSize2;
         fontSize3 *= fontSize2b / fontSize2;
         fontSize2 = fontSize2b;

         textFont = setFontSize(textFont, fontSize1);
         unitFont = setFontSize(unitFont, fontSize3);
      }

      if (!this.bNumericUnitsSameFont)
      {
         unitFont = adjustFontForRect(context, unitFont, this.numericUnitStr, targetUnits.width, targetUnits.height, 3);
         var fontSize3b = getFontSize(unitFont);
         if (fontSize3b < fontSize3)
         {
            fontSize1 *= fontSize3b / fontSize3;
            fontSize2 *= fontSize3b / fontSize3;
            fontSize3 = fontSize3b;

            textFont = setFontSize(textFont, fontSize1);
            numericFont = setFontSize(numericFont, fontSize2);
         }
      }
   }

   else if (this.bIncludeText) // text only, no numeric
   {
      textFont = adjustFontForRect(context, textFont, this.textStr, rect.width, rect.height, 3);
   }

   else if (this.bIncludeNumeric && !this.bNumericUnitsSameFont) {
      //--------------------------------------------------
      // Calculate the target sizes
      //--------------------------------------------------
      targetNumeric.width = targetUnits.width = rect.width - 5;
      targetNumeric.width = ratioNumeric * targetNumeric.width;
      targetUnits.width = (1 - ratioNumeric) * targetUnits.width;

      var font1 = getFontSize(numericFont);
      var font2 = getFontSize(unitFont);

      //--------------------------------------------------
      // Adjust the fonts
      //--------------------------------------------------
      numericFont = adjustFontForRect(context, numericFont, numericText, targetNumeric.width, targetNumeric.height, 3);
      var font1b = getFontSize(numericFont);
   
      if (font1 < font1b)
      {
         font2 *= (font1b / font1);
         font1 = font1b;
         unitFont = setFontSize(unitFont, font2);
      }

      unitFont = adjustFontForRect(context, unitFont, this.numericUnitStr, targetUnits.width, targetUnits.height, 3);
      var font2b = getFontSize(unitFont);

      if (font2 < font2b) {
         font1 *= (font2b / font2);
         font2 = font2b;
         numericFont = setFontSize(numericFont, font1);
      }
   }
   else// if (this.bIncludeNumeric && this.bNumericUnitsSameFont)
   {
      numericFont = adjustFontForRect(context, numericFont, numericText, rect.width, rect.height, 3);
   }

   //--------------------------------------------------------------------
   // And calculate the location.  The X position will shift if numeric
   // and units are different fonts.  The Y position will only need to change
   // if the text and numeric are in the same location
   //--------------------------------------------------------------------
   var textLoc_x = rect.left + this.textTextLocation.x;
   var textLoc_y = rect.top + this.textTextLocation.y;
   var numericTextLoc_x = rect.left + this.numericTextLocation.x;
   var numericTextLoc_y = rect.top + this.numericTextLocation.y;
   var unitTextLoc_x = rect.left + this.numericTextLocation.x;
   var unitTextLoc_y = rect.top + this.numericTextLocation.y;

   context.font = textFont;
   txtSize = measureText(context, this.textStr, this.textFontDecoration);
   txtSize.height = txtSize.height * 0.75;

   context.font = numericFont;
   numericSize = measureText(context, numericText, this.numericFontDecoration);
   numericSize.height = numericSize.height * 0.75;

   context.font = unitFont;
   unitSize = measureText(context, this.numericUnitStr, this.numericUnitFontDecoration);
   unitSize.height = unitSize.height * 0.75;

   if (this.bIncludeNumeric && !this.bNumericUnitsSameFont)
   {
      if (this.numericTextAlignment === "center")
      {
         var centerX = rect.left + rect.width / 2;
         var rightPt = centerX + (unitSize.width + numericSize.width + 5) / 2;

         unitTextLoc_x = rightPt - unitSize.width;
         numericTextLoc_x = unitTextLoc_x - 5;
      }
      else if (this.numericTextAlignment === "right")
      {
         numericTextLoc_x = rect.right - unitSize.width - 5;
         unitTextLoc_x = numericTextLoc_x + 5;
      }
      else
      {
         numericTextLoc_x = rect.left + numericSize.width;
         unitTextLoc_x = numericTextLoc_x + 5;
      }
   }

   if (this.bTextNumericSameLocation) {
      if (this.textTextBaseline === "top") {
         numericTextLoc_y = unitTextLoc_y = textLoc_y + txtSize.height + 5;
      }
      else if (this.textTextBaseline === "middle") {
         textLoc_y -= (txtSize.height * 0.5 + 2);
         numericTextLoc_y += (numericSize.height * 0.5 + 2);
         unitTextLoc_y = numericTextLoc_y;
      }
      else {
         textLoc_y = numericTextLoc_y - numericSize.height - 5;
      }
   }


   //--------------------------------------------------------------------
   // Now we can draw
   //--------------------------------------------------------------------
   if (this.bIncludeText) {
      context.font = textFont;
      context.textAlign = this.textTextAlignment;
      context.textBaseline = this.textTextBaseline;
      context.fillStyle = this.textColor;
      if (this.textTextBaseline === "bottom") {
         textLoc_y = textLoc_y - 3;
      }
      drawTextWithDecorations(context, this.textStr, textLoc_x, textLoc_y, txtSize, this.textFontDecoration);
   }

   if (this.bIncludeNumeric)
   {
      context.textBaseline = this.numericTextBaseline;

      if (this.bNumericUnitsSameFont)
      {
         context.textAlign = this.numericTextAlignment;
      }
      else
      {
         context.textAlign = "left";
         context.font = unitFont;
         context.fillStyle = this.numericUnitColor;
         drawTextWithDecorations(context, this.numericUnitStr, unitTextLoc_x, unitTextLoc_y, unitSize, this.numericUnitFontDecoration);
         context.textAlign = "right";
      }
      context.font = numericFont;
      context.fillStyle = this.numericColor;
      drawTextWithDecorations(context, numericText, numericTextLoc_x, numericTextLoc_y, numericSize, this.numericFontDecoration);
      if (alarm_data !== null) {
         if (isNaN(alarm_data.value)) {
            this.ownerAlarm.nan_data = true;
         }
         if ((alarm_data.value === -Infinity) || (alarm_data.value === Infinity)) {
            this.ownerAlarm.bad = true;
         }
      }
   }

};


Enum.ALARM_TYPE =
{
   STANDARD_DRAW: 0,
   LOCAL_IMAGE: 1,
   URL_IMAGE: 2
};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiNoDataAlarmState.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiImageAlarmState */



function CsiNoDataAlarmState(ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename, alarmTime)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiImageAlarmState.call(this, ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename);

   this.AlarmTime = alarmTime;
   this.lastValue = null;
   this.lastTimestamp = null;
   this.lastTimeReceivedData = null;
   this.inAlarmCondition = false;

   oneShotTimer.setTimeout(this, "NoData", this.AlarmTime);
}
CsiNoDataAlarmState.prototype = new CsiImageAlarmState();


CsiNoDataAlarmState.prototype.evaluate_condition = function (value, timestamp)
{
   if (this.is_off_state)
   {
      this.ownerAlarm.set_show_alarm(this, false);
      return;
   }

   var prev_show_alarm = this.show_alarm;

   //received new data?
   if(timestamp !== this.lastTimestamp)
   {
      //new data
      this.lastTimestamp = timestamp;
      this.lastTimeReceivedData = new Date().getTime();

      if(!this.show_alarm)
      {
         //clear previous timeout.  It will be restarted.
         oneShotTimer.clearTimeout(this, "NoData");
      }
      else //check if no longer alarm condition
      {
         if(this.stop_option === Enum.STOP_CONDITION.NORMAL)
         {
            this.ownerAlarm.set_show_alarm(this, false);
         }
         else //Enum.STOP_CONDITION.LATCHED
         {
            this.ownerAlarm.set_show_alarm(this, !this.ownerAlarm.alarm_acknowledged);
         }
      }

      //start timer.  If timer fires before data comes in, alarmCondition = true
      if(!this.show_alarm)
      {
         oneShotTimer.setTimeout(this, "NoData", this.AlarmTime);
      }
   }
   else
   {
      //not new data.  Exceeded the Alarm Time? Turn off Alarm?
      if(new Date().getTime() - this.lastTimeReceivedData >= this.AlarmTime)
      {
         this.ownerAlarm.set_show_alarm(this, true); //exceeded alarm time
      }
      else if((this.stop_option === Enum.STOP_CONDITION.LATCHED) && (this.show_alarm) && (this.ownerAlarm.alarm_acknowledged))
      {
         this.ownerAlarm.set_show_alarm(this, false); //alarm has been acknowledged and received data within AlarmTime
      }
   }

   //alarm state changing?
   if(prev_show_alarm !== this.show_alarm)
   {
      if(this.show_alarm)
      {
         //entering alarm state
         this.ownerAlarm.invalidate();
         this.playAudio();
      }
      else
      {
         this.stopAudio();
         this.ownerAlarm.alarm_acknowledged = false;
      }
   }
};


CsiNoDataAlarmState.prototype.onOneShotTimer = function (tag)
{
   if(tag === "NoData")
   {
      const prevStateToDraw = this.ownerAlarm.stateToDraw;
      this.evaluate_condition(this.lastValue, this.lastTimestamp);

      this.ownerAlarm.stateToDraw = this.ownerAlarm.alarmStates[0];
      for (let i = 1; i < this.ownerAlarm.alarmStates.length; i++) {
         if (this.ownerAlarm.alarmStates[i].show_alarm) {
            this.ownerAlarm.stateToDraw = this.ownerAlarm.alarmStates[i];
            break;
         }
      }

      if (prevStateToDraw !== this.stateToDraw) {
         this.ownerAlarm.copyBackgroundProps(this.ownerAlarm.stateToDraw, this.ownerAlarm);

         graphicsManager.update_alarm_tabs();
         this.ownerAlarm.alarm_acknowledged = false;
         this.ownerAlarm.invalidate();
      }
   }
   else
   {
      CsiImageAlarmState.prototype.onOneShotTimer.call(this, tag);
   }
};

CsiNoDataAlarmState.prototype.drawStandardImage = function (context, rect)
{
   if (rect.width < 5 || rect.height < 5)
      return;

   context.save();
   let origColor = this.standardColor;
   if (this.show_alarm && this.ownerAlarm.alarm_acknowledged) {
      this.standardColor = this.acknowledgedStandardColor;
   }

   var radiusX = rect.width / 2;
   var radiusY = rect.height / 2;
   var XYRatio = radiusY / radiusX;
   var centerX = rect.width / 2;
   var centerY = (rect.height / 2) / XYRatio;
   var endX = radiusX / 5;
   var endY = centerY - radiusY / 5;

   var gradient = context.createRadialGradient(centerX, centerY, radiusX, endX, endY, 0);
   gradient.addColorStop(0.0, "black");
   gradient.addColorStop(0.1, this.standardColor);
   gradient.addColorStop(1.0, this.is_off_state ? this.standardColor : "white");

   context.beginPath();
   context.transform(1, 0, 0, XYRatio, rect.left, rect.top);
   context.fillStyle = gradient;
   context.ellipse(centerX, centerY, radiusX, radiusY / XYRatio, 0, 0, 2 * Math.PI);
   context.fill();

   this.standardColor = origColor;
   context.restore();
};
/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiRateChangeAlarmState.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.
Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood
*/

/* global CsiImageAlarmState: true */
/* global CsiAlarmState: true */


function CsiRateChangeAlarmState(ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiImageAlarmState.call(this, ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename);

   //second to most recent value
   this.lastValue2 = null;
   this.lastTimestamp2 = null;

   //most recent last value
   this.lastValue1 = null;
   this.lastTimestamp1 = null;
}
CsiRateChangeAlarmState.prototype = new CsiImageAlarmState();


CsiRateChangeAlarmState.prototype.evaluate_condition = function (value, timestamp)
{
   if (this.is_off_state)
   {
      this.ownerAlarm.set_show_alarm(this, false);
      return;
   }

   var rateOfChange;

   if(timestamp !== this.lastTimestamp1)
   {
      //move most recent value to second to most recent value
      this.lastValue2 = this.lastValue1;
      this.lastTimestamp2 = this.lastTimestamp1;

      //save new value
      this.lastValue1 = value;
      this.lastTimestamp1 = timestamp;
   }

   //check rate of change only after receiving two values
   if(this.lastValue1 && this.lastValue2) 
   {
      rateOfChange = this.lastValue1 - this.lastValue2;
      CsiAlarmState.prototype.evaluate_condition.call(this, rateOfChange, timestamp);
   }
};


CsiRateChangeAlarmState.prototype.drawStandardImage = function (context, rect)
{
   if (rect.width < 10 || rect.heigth < 10)
      return;

   context.save();
   let origColor = this.standardColor;
   if (this.show_alarm && this.ownerAlarm.alarm_acknowledged) {
      this.standardColor = this.acknowledgedStandardColor;
   }

   var radiusX = rect.width / 2;
   var radiusY = rect.height / 2;
   var XYRatio = radiusY / radiusX;
   var centerX = rect.width / 2;
   var centerY = (rect.height / 2) / XYRatio;
   var endX = radiusX / 5;
   var endY = centerY - radiusY / 5;

   var gradient = context.createRadialGradient(centerX, centerY, radiusX, endX, endY, 0);
   gradient.addColorStop(0.0, "black");
   gradient.addColorStop(0.1, this.standardColor);
   gradient.addColorStop(1.0, this.is_off_state ? this.standardColor: "white");

   context.beginPath();
   context.transform(1, 0, 0, XYRatio, rect.left, rect.top);
   context.fillStyle = gradient;
   context.ellipse(centerX, centerY, radiusX, radiusY / XYRatio, 0, 0, 2 * Math.PI);
   context.fill();

   this.standardColor = origColor;
   context.restore();
};

/* $HeadURL: svn://engsoft/cora/rtmc/javascript/CsiCommStatusAlarmState.js $

Copyright (C) 2010, 2018 Campbell Scientific, Inc.
Started On: 12/18/2018 4:39:33 PM
Started By: Joel Devey
*/

/* global CsiImageAlarmState: true */


function CsiCommStatusAlarmState(ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename)
{
   //Do not add properties to prototype
   if (arguments.length === 0)
   {
      return;
   }

   CsiImageAlarmState.call(this, ownerAlarm, imageFilename, wavFilename, mp3Filename, oggFilename);
}
CsiCommStatusAlarmState.prototype = new CsiImageAlarmState();


CsiCommStatusAlarmState.prototype.drawStandardImage = function (context, rect)
{
   if (rect.width < 10 || rect.heigth < 10)
      return;

   context.save();

   let origColor = this.standardColor;
   if (this.show_alarm && this.ownerAlarm.alarm_acknowledged) {
      this.standardColor = this.acknowledgedStandardColor;
   }

   var radiusX = rect.width / 2;
   var radiusY = rect.height / 2;
   var XYRatio = radiusY / radiusX;
   var centerX = rect.width / 2;
   var centerY = (rect.height / 2) / XYRatio;
   var endX = radiusX / 5;
   var endY = centerY - radiusY / 5;

   var gradient = context.createRadialGradient(centerX, centerY, radiusX, endX, endY, 0);
   gradient.addColorStop(0.0, "black");
   gradient.addColorStop(0.1, this.standardColor);
   gradient.addColorStop(1.0, "white");

   context.save();
   context.beginPath();
   context.transform(1, 0, 0, XYRatio, rect.left, rect.top);
   context.fillStyle = gradient;
   context.ellipse(centerX, centerY, radiusX, radiusY / XYRatio, 0, 0, 2 * Math.PI);
   context.fill();
   context.restore();

   if (this.is_off_state)
      this.drawCheckMark(context, rect);
   else
      this.drawX(context, rect);

   this.standardColor = origColor;
   context.restore();
};


// After calling this function, set a style, then stroke or fill
CsiImageAlarmState.prototype.drawPolygonWithRotation = function (context, points, rotationAngle, rotationCenterX, rotationCenterY)
{
   var new_points = [];
   var i = 0;
   for (; i < points.length; ++i)
   {
      new_points.push([points[i][0] - rotationCenterX, points[i][1] - rotationCenterY]);
   }
   context.translate(rotationCenterX, rotationCenterY);
   context.rotate(rotationAngle);
   context.beginPath();

   context.moveTo(new_points[0][0], new_points[0][1]);

   i = 1;
   for (; i < new_points.length; ++i)
   {
      context.lineTo(new_points[i][0], new_points[i][1]);
   }
};


CsiCommStatusAlarmState.prototype.drawCheckMark = function (context, rect)
{
   context.save();

   // Shrink component rectangle by a factor of two for the checkmark rectangle
   rect = new Rect(rect.left + rect.width / 4, rect.top + rect.height / 4, rect.width / 2, rect.height / 2);

   // Let the checkmark rectangle be square (shrink longer side and adjust so center remains the same)
   var origCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
   rect.width = Math.min(rect.width, rect.height);
   rect.height = rect.width;
   var newCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
   var requiredShift = { x: origCenter.x - newCenter.x, y: origCenter.y - newCenter.y };
   rect.left += requiredShift.x;
   rect.top += requiredShift.y;
   rect.updateRight();
   rect.updateBottom();

   var points = [];

   points.push([
      rect.left,
      rect.top + (rect.height * (2.0 / 3.0))
   ]);
   points.push([
      rect.left + (rect.width * (1.0 / 3.0)),
      rect.top + (rect.height * (2.0 / 3.0))
   ]);
   points.push([
      rect.left + (rect.width * (1.0 / 3.0)),
      rect.top
   ]);
   points.push([
      rect.left + (rect.width * (2.0 / 3.0)),
      rect.top
   ]);
   points.push([
      rect.left + (rect.width * (2.0 / 3.0)),
      rect.bottom
   ]);
   points.push([
      rect.left,
      rect.bottom
   ]);

   this.drawPolygonWithRotation(context, points, Math.PI / 4, rect.left + rect.width / 2, rect.top + rect.height / 2);

   context.fillStyle = "#000000";

   context.fill();

   context.restore();
};


CsiCommStatusAlarmState.prototype.drawX = function (context, rect)
{
   context.save();

   // Shrink component rectangle by a factor of two for the checkmark rectangle
   rect = new Rect(rect.left + rect.width / 4, rect.top + rect.height / 4, rect.width / 2, rect.height / 2);

   // Let the checkmark rectangle be square (shrink longer side and adjust so center remains the same)
   var origCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
   rect.width = Math.min(rect.width, rect.height);
   rect.height = rect.width;
   var newCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
   var requiredShift = { x: origCenter.x - newCenter.x, y: origCenter.y - newCenter.y };
   rect.left += requiredShift.x;
   rect.top += requiredShift.y;
   rect.updateRight();
   rect.updateBottom();

   var points = [];

   points.push([
      rect.left,
      rect.top + (rect.height / 4.0)
   ]);
   points.push([
      rect.left + (rect.width / 4.0),
      rect.top
   ]);
   points.push([
      rect.left + (rect.width / 2.0),
      rect.top + (rect.height / 4.0)
   ]);
   points.push([
      rect.left + (rect.width * (3.0 / 4.0)),
      rect.top
   ]);
   points.push([
      rect.right,
      rect.top + (rect.height / 4.0)
   ]);
   points.push([
      rect.left + (rect.width * (3.0 / 4.0)),
      rect.top + (rect.height / 2.0)
   ]);
   points.push([
      rect.right,
      rect.top + (rect.height * (3.0 / 4.0))
   ]);
   points.push([
      rect.left + (rect.width * (3.0 / 4.0)),
      rect.bottom
   ]);
   points.push([
      rect.left + (rect.width / 2.0),
      rect.top + (rect.height * (3.0 / 4.0))
   ]);
   points.push([
      rect.left + (rect.width / 4.0),
      rect.bottom
   ]);
   points.push([
      rect.left,
      rect.top + (rect.height * (3.0 / 4.0))
   ]);
   points.push([
      rect.left + (rect.width / 4.0),
      rect.top + (rect.height / 2.0)
   ]);

   this.drawPolygonWithRotation(context, points, 0, rect.left + rect.width / 2, rect.top + rect.height / 2);

   context.fillStyle = "#000000";

   context.fill();

   context.restore();
};
/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiImageAlarm.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiAlarm: true */
/* global CsiImageAlarmState: true */
/* global CsiRateChangeAlarmState: true */
/* global CsiNoDataAlarmState: true */
/* global CsiCommStatusAlarmState: true */


function CsiImageAlarm(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiAlarm.call(this, left, top, width, height, expression);

   this.ready = false;

   this.check_all_ready();
}
CsiImageAlarm.prototype = new CsiAlarm();


function CsiMultiStateImage(left, top, width, height, expression)
{
   CsiImageAlarm.call(this, left, top, width, height, expression);
}
CsiMultiStateImage.prototype = new CsiImageAlarm();



CsiImageAlarm.prototype.createImageAlarmState = function (imageFilename, wavFilename, mp3Filename, oggFilename)
{
   var state = new CsiImageAlarmState(this, imageFilename, wavFilename, mp3Filename, oggFilename);
   this.alarmStates.push(state);
   if (this.stateToDraw === null)
   {
      this.stateToDraw = state;
      this.copyBackgroundProps(this.stateToDraw, this);
   }

   return state;
};


CsiImageAlarm.prototype.createRateChangeAlarmState = function (imageFilename, wavFilename, mp3Filename, oggFilename)
{
   var state = new CsiRateChangeAlarmState(this, imageFilename, wavFilename, mp3Filename, oggFilename);
   this.alarmStates.push(state);
   if (this.stateToDraw === null)
   {
      this.stateToDraw = state;
      this.copyBackgroundProps(this.stateToDraw, this);
   }

   return state;
};


CsiImageAlarm.prototype.createNoDataAlarmState = function (imageFilename, wavFilename, mp3Filename, oggFilename, alarmTime)
{
   var state = new CsiNoDataAlarmState(this, imageFilename, wavFilename, mp3Filename, oggFilename, alarmTime);
   this.alarmStates.push(state);
   if (this.stateToDraw === null)
   {
      this.stateToDraw = state;
      this.copyBackgroundProps(this.stateToDraw, this);
   }

   return state;
};


CsiImageAlarm.prototype.createCommStatusAlarmState = function (imageFilename, wavFilename, mp3Filename, oggFilename, alarmTime)
{
   var state = new CsiCommStatusAlarmState(this, imageFilename, wavFilename, mp3Filename, oggFilename, alarmTime);
   this.alarmStates.push(state);
   if (this.stateToDraw === null)
   {
      this.stateToDraw = state;
      this.copyBackgroundProps(this.stateToDraw, this);
   }
   return state;
};


CsiImageAlarm.prototype.off_img_onload = function ()
{
   this.loaded = true;
   this.owner.check_all_ready();
};


CsiImageAlarm.prototype.off_img_onerror = function ()
{
   var owner = this.owner; //Make local copy since we are nulling ourselves
   owner.off_img = null;
   owner.check_all_ready();
};


CsiImageAlarm.prototype.draw = function (context)
{
   context.save();

   var stateToDraw = this.stateToDraw;

   var rect = new Rect(this.left, this.top, this.width, this.height);

   if (stateToDraw.bIncludeImage)
   {
      stateToDraw.drawImage(context, rect);
   }

   if (stateToDraw.bIncludeText || stateToDraw.bIncludeNumeric)
   {
      stateToDraw.drawText(context, rect, this.alarm_data, this.lastValue);
   }


   this.drawAlarmAcknowledged(context, rect);

   context.restore();
};


CsiImageAlarm.prototype.check_all_ready = function ()
{
   if(this.ready) //Don't do anything if we are already ready
   {
      return;
   }

   var still_loading = false;

   if(this.off_img && this.off_img.loaded === false)
   {
      still_loading = true;
   }

   if(!still_loading) //Only check each state if we need to
   {
      var len = this.alarmStates.length;
      var i;
      for(i = 0; i < len && !still_loading; i++)
      {
         if(this.alarmStates[i].check_still_loading())
         {
            still_loading = true;
         }
      }
   }

   if(!still_loading)
   {
      this.ready = true;
   }

   if(this.ready)
   {
      this.invalidate();
   }
};



// Multistate images are now alarms, so no need to say "Acknowledge Alarm"
CsiMultiStateImage.prototype.OnRButtonClick = function (mouseX, mouseY)
{

};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiLabel.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

 */

/* global adjustFontForRect */
/* global getLinesAndFont */
/* global drawTextWithDecorations */


function CsiLabel(left, top, width, height, caption)
{
   //Do not add properties to prototype
   if (arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   this.caption = caption || "";
   this.multiline_caption = String(this.caption);
   this.font = "12pt Arial";
   this.font_color = "rgba(0, 0, 0, 1)";
   this.displayVertically = false;
   this.textAlign = Enum.ALIGNMENT.CENTER;
   this.textBaseline = "middle";
   this.word_wrap = false;
   this.multilines = null;
   this.linesAndFont = null;
   this.bad_data = false;
   this.force_multiline = false; //For ReportNote

}
CsiLabel.prototype = new CsiComponent();


CsiLabel.prototype.draw = function (context)
{
   context.save();

   var rect = new Rect(-this.width / 2, -this.height / 2, this.width, this.height);
   context.translate(this.left + this.width / 2, this.top + this.height / 2);

   context.font = this.font;
   context.textBaseline = this.textBaseline;
   context.fillStyle = this.font_color;

   var margin = 3;
   var i = 0;
   var textSize = measureText(context, this.caption);

   if (this.displayVertically)
   {
      var newFont = adjustFontForRect(context, context.font, this.caption, rect.width, rect.height, margin, true);
      context.font = newFont;
      context.textAlign = "center";
      context.textBaseline = "top";

      var text_height = context.measureText("W").width * 1.5;
      var len = this.caption.length;
      var x_offset = 0;
      var y_offset = 0;

      for (i = 0; i < len; i++)
      {
         textSize = measureText(context, this.caption[i]);
         textSize.height = textSize.height * 0.65;
         switch (this.textAlign)
         {
            case Enum.ALIGNMENT.LEFT: //Top
               if (i === 0)
               {
                  y_offset = -rect.height / 2 + margin;
               }
               drawTextWithDecorations(context, this.caption[i], x_offset, y_offset, textSize, this.fontDecoration);
               y_offset += text_height;
               break;
            case Enum.ALIGNMENT.CENTER: //Middle
               if (i === 0)
               {
                  y_offset = -text_height * len / 2;
               }
               drawTextWithDecorations(context, this.caption[i], x_offset, y_offset, textSize, this.fontDecoration);
               y_offset += text_height;
               break;
            case Enum.ALIGNMENT.RIGHT: //Bottom
               if (i === 0)
               {
                  y_offset = rect.height / 2 - text_height * len - margin;
               }
               drawTextWithDecorations(context, this.caption[i], x_offset, y_offset, textSize, this.fontDecoration);
               y_offset += text_height;
               break;
         }
      }
   }
   else
   {
      if (!this.multilines || this.multiline_caption !== this.caption) 
      {
         this.linesAndFont = getLinesAndFont(context, this.caption, rect.width-4, rect.height * 2, margin, this.word_wrap);
         this.multilines = this.linesAndFont.lines;
         this.multiline_caption = String(this.caption); //cache this so we can see if it changes
      }
      else if (this.linesAndFont === null)
      {
         this.linesAndFont = { lines: this.caption, font: this.font };
      }
      context.font = this.linesAndFont.font;
      var char_size = context.measureText("W").width * 1.5;

      if (this.force_multiline || this.multilines.length > 1)
      {
         context.textBaseline = "top";
         var line_count = this.multilines.length;
         var total_char_height = char_size * line_count;

         var cur_height = 2;
         if (!this.force_multiline)
         {
            cur_height = -total_char_height / 2.0;
         }

         for (i = 0; i < line_count; i++)
         {
            var cur_line = this.multilines[i];
            textSize = measureText(context, cur_line);
            textSize.height = textSize.height * 0.65;
            switch (this.textAlign)
            {
               case Enum.ALIGNMENT.LEFT:
                  context.textAlign = "left";
                  drawTextWithDecorations(context, cur_line, -rect.width / 2 + margin /* + char_size / 2*/, cur_height, textSize, this.fontDecoration);
                  break;
               case Enum.ALIGNMENT.CENTER:
                  context.textAlign = "center";
                  drawTextWithDecorations(context, cur_line, 0, cur_height, textSize, this.fontDecoration);
                  break;
               case Enum.ALIGNMENT.RIGHT:
                  context.textAlign = "right";
                  drawTextWithDecorations(context, cur_line, rect.width / 2 - margin /* - char_size / 2*/, cur_height, textSize, this.fontDecoration);
                  break;
               default:
                  break;
            }
            cur_height += char_size;
         }
      }
      else
      {        
         textSize.height = textSize.height * 0.65;
         switch (this.textAlign)
         {
            case Enum.ALIGNMENT.CENTER:
               context.textAlign = "center";
               drawTextWithDecorations(context, this.caption, 0, 0, textSize, this.fontDecoration);
               break;
            case Enum.ALIGNMENT.LEFT:
               context.textAlign = "left";
               drawTextWithDecorations(context, this.caption, -rect.width / 2 + margin, 0, textSize, this.fontDecoration);
               break;
            case Enum.ALIGNMENT.RIGHT:
               context.textAlign = "right";
               drawTextWithDecorations(context, this.caption, rect.width / 2 - margin, 0, textSize, this.fontDecoration);
               break;
            default:
               break;
         }
      }
   }
   context.restore();
};


/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiValueSetter.js $

   Copyright (C) 2010, 2019 Campbell Scientific, Inc.

   Started On: 10/5/2010 7:49:52 AM
   Started By: Kevin Westwood

*/


function CsiValueSetter()
{
   this.set_uri = '';
   this.write_value = 0;
   this.state = Enum.SetValueState.none;
   this.ownerComponent = null;
}

CsiValueSetter.prototype.setValue = function (uri, value)
{
   if(this.ownerComponent === null) 
   {
      return;
   }

   if((this.state === Enum.SetValueState.success) ||
       (this.state === Enum.SetValueState.fail))
   {
      oneShotTimer.clearTimeout(this, null); //cancel 5 second timeout to signal a finish on a set
   }

   this.state = Enum.SetValueState.currentlySetting;
   var setter = this;
   setter.set_uri = uri;
   setter.write_value = value;

   $.ajax({
      url: ".?command=SetValueEx&format=json&uri=" + encodeURIComponent(setter.set_uri) + "&value=" + encodeURIComponent(setter.write_value),
      dataType: 'json',
      cache: false,
      timeout: 60000,
      beforeSend: function (xhr)
      {
         setter.before_set_attempt(xhr);
      },
      success: function (json, status, xhr)
      {
         setter.set_attempt_success(json, status, xhr);
      },
      error: function (xhr, status, error)
      {
         setter.set_attempt_error(xhr, status, error);
      }
   });
};


CsiValueSetter.prototype.before_set_attempt = function(xhr)
{
   this.state = Enum.SetValueState.currentlySetting;
   this.ownerComponent.invalidate();
};


CsiValueSetter.prototype.set_attempt_success = function (json, status, xhr)
{
   if(json)
   {
      if(json.outcome === 1)
      {
         this.state = Enum.SetValueState.success;
      }
      else
      {
         this.state = Enum.SetValueState.fail;
      }
   }
   else //no json, so error
   {
      this.state = Enum.SetValueState.fail;
   }

   this.ownerComponent.invalidate();

   if(this.state === Enum.SetValueState.success)
   {
      if(typeof this.ownerComponent.on_set_value_success === "function")
      {
         this.ownerComponent.on_set_value_success();
      }
   }
   else
   {
      if(typeof this.ownerComponent.on_set_value_failure === "function")
      {
         this.ownerComponent.on_set_value_failure();
      }
   }

   oneShotTimer.setTimeout(this, null, 5000);
};


CsiValueSetter.prototype.set_attempt_error = function (xhr, status, error)
{
   this.state = Enum.SetValueState.fail;
   this.ownerComponent.invalidate();
   if(typeof this.ownerComponent.on_set_value_failure === "function")
   {
      this.ownerComponent.on_set_value_failure();
   }

   oneShotTimer.setTimeout(this, null, 5000);
};

CsiValueSetter.prototype.onOneShotTimer = function (tag)
{
   //set was completed and this timer is fired 5 seconds afterward
   this.state = Enum.SetValueState.none;
   this.ownerComponent.invalidate();

   if(typeof this.ownerComponent.on_set_value_finished === "function")
   {
      this.ownerComponent.on_set_value_finished();
   }
};

Enum.SetValueState =
{
   none: 0,
   currentlySetting: 1,
   success: 2,
   fail: 3
};


// Draws a red, yellow, or green border around a component that sets
// values based on whether the value has been set, is setting, or
// has failed.
CsiValueSetter.prototype.drawSetValueBorder = function (context, setValueState, rect)
{
   switch(setValueState)
   {
      case Enum.SetValueState.none:
         return;
      case Enum.SetValueState.currentlySetting:
         context.strokeStyle = "#FFFF00"; // yellow
         break;
      case Enum.SetValueState.success:
         context.strokeStyle = "#00FF00"; // green
         break;
      case Enum.SetValueState.fail:
         context.strokeStyle = "#FF0000"; // red
         break;
   }

   context.beginPath();
   context.lineWidth = 4;
   // because the lineWidth is 4, it is moved in 2 pixel. This keeps it within
   // the boundaries of the control
   context.strokeRect(rect.left + 2, rect.top + 2, rect.width - 4, rect.height - 4);
};
/* CsiMouseEvents.js

   Copyright (C) 2010, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: 5 October 2010

*/

/*component mouse events
OnLButtonClick/OnRButtonClick:  Mouse was pressed and released on component
OnLButtonDblClk: Left Mouse was double clicked
OnLButtonDown/OnRButtonDown:  Mouse button was pressed down on component
OnLButtonUp/OnRButtonUp:  Mouse button was released on component
OnMouseDrag: MouseDrag on a component. Mouse position can be inside or outside the range of the component.
OnMouseDragEnd: Left Mouse button was lifted after a drag (inside or outside the comp)
OnMouseRelease:  Left Mouse button was released after first pressing down on a comp.  The mouse can be inside or outside the component.
OnMouseEnter:  Mouse entered component
OnMouseExit:  Mouse exited component
OnMouseMove:  Mouse moved while over component
*/

/* global canvasOffsetX: true */
/* global canvasOffsetY: true */

var csiMouseEvents = null; //GLOBAL DECLARATION

function init_mouse()
{
   var canvas = $('#rtmc_canvas');
   csiMouseEvents = new CsiMouseEvents();
   canvas.mousedown(function (evt) { csiMouseEvents.onMouseDown(evt); });
   canvas.mouseup(function (evt) { csiMouseEvents.onMouseUp(evt); });
   canvas.mousemove(function (evt) { csiMouseEvents.onMouseMove(evt); });
   canvas.dblclick(function (evt) { csiMouseEvents.onDblClick(evt); });
   canvas.mouseout(function (evt) { csiMouseEvents.onMouseOut(evt); });

   canvas[0].addEventListener("touchstart", CsiMouseEvents.onTouchStart, false);
   canvas[0].addEventListener("touchend", CsiMouseEvents.onTouchEnd, false);
   canvas[0].addEventListener("touchmove", CsiMouseEvents.onTouchMove, false);
   document.body.addEventListener("touchcancel", CsiMouseEvents.onTouchCancel, false);
}

//Disable default browser context menu
$(document).on("contextmenu", function (e) { return false; });

//this class handles all mouse events
function CsiMouseEvents()
{
   this.mouseDownPos = null; //Track this position to make sure the mouseUp event triggers a click only if needed
   this.leftMouseDownComp = null;  //left mouseDown occurred on component
   this.rightMouseDownComp = null; //right mouseDown occurred on component
   this.mouseOverComp = null; //last component which the mouse moved over
   this.dragComp = null; //component being dragged with left button
   this.lastTouchPos = null; //Track the last touch position
   this.gestures = [];
}


CsiMouseEvents.find_touch_comp = function (event)
{
   var rtn =
   {
      component: null,
      touch_x: NaN,
      touch_y: NaN
   };
   var touch_count = event.touches.length;
   var touch_test;
   var touch;
   var touch_point;

   for(var i = 0; i < touch_count; ++i)
   {
      touch = event.touches[i];
      touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
      rtn.touch_x = touch_point.x;
      rtn.touch_y = touch_point.y;
      touch_test = graphicsManager.hit_test_by_need(rtn.touch_x, rtn.touch_y);
      if(!rtn.component && touch_test)
      {
         rtn.component = touch_test;
      }
      else if(rtn != touch_test)
      {
         rtn.component = null;
         break;
      }
   }
   return rtn;
};


CsiMouseEvents.onTouchStart = function (evt)
{
   // we will give the list of gestures first crack on the event.
   var gestures_len = csiMouseEvents.gestures.length;
   csi_log("touch start event with " + evt.touches.length + " touches");
   for(var i = 0; i < gestures_len; ++i)
   {
      csiMouseEvents.gestures[i].on_touch_start(evt);
   }
};


CsiMouseEvents.onTouchMove = function (evt)
{
   // give the registered gestures first cut at the event
   var gestures_len = csiMouseEvents.gestures.length;
   var handled = false;
   csi_log("touch move event with " + evt.touches.length + " touches");
   for(var i = 0; i < gestures_len; ++i)
   {
      csiMouseEvents.gestures[i].on_touch_move(evt);
   }
};


CsiMouseEvents.onTouchEnd = function (evt)
{
   // give the registered gestures first crack at the event
   var gestures_len = csiMouseEvents.gestures.length;
   csi_log("touch end event with " + evt.touches.length + " touches");
   for(var i = 0; i < gestures_len; ++i)
   {
      csiMouseEvents.gestures[i].on_touch_end(evt);
   }
};


CsiMouseEvents.onTouchCancel = function (event)
{
   CsiMouseEvents.onTouchEnd(event);
};


CsiMouseEvents.prototype.onDblClick = function (evt)
{
   var mouseX = evt.pageX - canvasOffsetX;
   var mouseY = evt.pageY - canvasOffsetY;
   var hit_comp = graphicsManager.hit_test_by_need(mouseX, mouseY);
   if(hit_comp)
   {
      if(evt.button === Enum.BUTTON.LEFT)
      {
         if(typeof hit_comp.OnLButtonDblClk === "function")
         {
            hit_comp.OnLButtonDblClk(mouseX, mouseY);
         }
      }
   }
};


CsiMouseEvents.prototype.onMouseDown = function (evt)
{
   graphicsManager.stopAutoTabbing();

   this.hideMenu();

   var mouseX = evt.pageX - canvasOffsetX;
   var mouseY = evt.pageY - canvasOffsetY;
   this.mouseDownPos = new Point(mouseX, mouseY); //store the click pos
   var hit_comp = graphicsManager.hit_test_by_need(mouseX, mouseY);

   if(evt.button === Enum.BUTTON.LEFT)
   {
      this.leftMouseDownComp = hit_comp;
      if(hit_comp)
      {
         if(typeof hit_comp.OnLButtonDown === "function")
         {
            hit_comp.OnLButtonDown(mouseX, mouseY);
         }
      }
   }
   else if(evt.button === Enum.BUTTON.RIGHT)
   {
      this.rightMouseDownComp = hit_comp;
      if(hit_comp)
      {
         if(typeof hit_comp.OnRButtonDown === "function")
         {
            hit_comp.OnRButtonDown(mouseX, mouseY);
            return false; //Stop the right click event from moving to page
         }
      }
   }
   return true;
};


CsiMouseEvents.prototype.onMouseUp = function (evt)
{
   graphicsManager.stopAutoTabbing();

   var result = true;
   var mouseX = evt.pageX - canvasOffsetX;
   var mouseY = evt.pageY - canvasOffsetY;
   var hit_comp = graphicsManager.hit_test_by_need(mouseX, mouseY);

   if(evt.button === Enum.BUTTON.LEFT)
   {
      if(hit_comp)
      {
         //LButtonUp
         if(typeof hit_comp.OnLButtonUp === "function")
         {
            hit_comp.OnLButtonUp(mouseX, mouseY);
         }

         //LButtonClick
         if(hit_comp === this.leftMouseDownComp &&
            this.mouseDownPos.x === mouseX &&
            this.mouseDownPos.y === mouseY)
         {
            if(typeof hit_comp.OnLButtonClick === "function")
            {
               hit_comp.OnLButtonClick(mouseX, mouseY);
            }
         }
      }

      if(this.dragComp)
      {
         if(typeof this.dragComp.OnMouseDragEnd === "function")
         {
            this.dragComp.OnMouseDragEnd(mouseX, mouseY);
         }
      }

      if(this.leftMouseDownComp)
      {
         if(typeof this.leftMouseDownComp.OnMouseRelease === "function")
         {
            this.leftMouseDownComp.OnMouseRelease(mouseX, mouseY);
         }
      }

      this.leftMouseDownComp = null;
      this.dragComp = null;
   }
   else if(evt.button === Enum.BUTTON.RIGHT)
   {
      if(hit_comp)
      {
         if(typeof hit_comp.OnRButtonUp === "function")
         {
            hit_comp.OnRButtonUp(mouseX, mouseY);
            result = false; //Stop the right click event from moving to page
         }

         if(hit_comp === this.rightMouseDownComp)
         {
            if(typeof hit_comp.OnRButtonClick === "function")
            {
               if(this.mouseDownPos.x === mouseX && this.mouseDownPos.y === mouseY)
               {
                  hit_comp.OnRButtonClick(mouseX, mouseY);
               }
            }
         }
      }

      this.rightMouseDownComp = null;
   }

   return result;
};


CsiMouseEvents.prototype.onMouseMove = function (evt)
{
   const mouseX = evt.pageX - canvasOffsetX;
   const mouseY = evt.pageY - canvasOffsetY;
   const hit_comp = graphicsManager.hit_test_by_need(mouseX, mouseY);
   var hover_comp = null;

   if (hit_comp === null)
      hover_comp = graphicsManager.hit_test_hover(mouseX, mouseY);

   //mouseExit
   if (this.mouseOverComp)
   {
      if ((this.mouseOverComp !== hit_comp) || (hover_comp !== null && this.mouseOverComp !== hover_comp))
      {
         if (typeof this.mouseOverComp.OnMouseExit === "function")
         {
            this.mouseOverComp.OnMouseExit();
         }

         //allow selection in document after leaving component
         document.onselectstart = function () { return true; };
      }
   }

   if(hit_comp)
   {
      //MouseEnter
      if(hit_comp !== this.mouseOverComp)
      {
         if(typeof hit_comp.OnMouseEnter === "function")
         {
            hit_comp.OnMouseEnter(mouseX, mouseY);
         }

         //do not show the select cursor when dragging from a dragable component
         if(!hit_comp.showSelectCursor)
         {
            document.onselectstart = function () { return false; };
         }
      }

      //MouseMove
      if(typeof hit_comp.OnMouseMove === "function")
      {
         hit_comp.OnMouseMove(mouseX, mouseY);
      }
   }
   else if (hover_comp)
   {
      if (typeof hover_comp.OnMouseEnter === "function")
      {
         hover_comp.OnMouseEnter(mouseX, mouseY);
      }

      //do not show the select cursor when dragging from a dragable component
      if (!hover_comp.showSelectCursor)
      {
         document.onselectstart = function () { return false; };
      }

      //MouseMove
      if (typeof hover_comp.OnMouseMove === "function") {
         hover_comp.OnMouseMove(mouseX, mouseY);
      }
   }

   //left drag
   if(this.leftMouseDownComp)
   {
      this.dragComp = this.leftMouseDownComp;
      if(typeof this.dragComp.OnMouseDrag === "function")
      {
         this.dragComp.OnMouseDrag(mouseX, mouseY);
      }
   }


   this.mouseOverComp = hit_comp;
   if (this.mouseOverComp === null)
      this.mouseOverComp = hover_comp;

   return true;
};


CsiMouseEvents.prototype.hideMenu = function ()
{
   var selector = $("#context");
   if(selector.length !== 0)
   {
      selector.remove();
      graphicsManager.OnMenuHidden();
   }
};


CsiMouseEvents.prototype.onMouseOut = function (evt)
{
   var mouseX = evt.pageX - canvasOffsetX;
   var mouseY = evt.pageY - canvasOffsetY;
   var hit_comp = graphicsManager.hit_test_by_need(mouseX, mouseY);
   var hover_comp = graphicsManager.hit_test_hover(mouseX, mouseY);

   //mouseExit
   if((this.mouseOverComp) && (this.mouseOverComp !== hit_comp) && (this.mouseOverComp !== hover_comp))
   {
      if(typeof this.mouseOverComp.OnMouseExit === "function")
      {
         this.mouseOverComp.OnMouseExit();
      }

      //allow selection in document after leaving component
      document.onselectstart = function () { return true; };
   }

   this.mouseDownPos = null; //Track this position to make sure the mouseUp event triggers a click only if needed
   this.leftMouseDownComp = null;  //left mouseDown occurred on component
   this.rightMouseDownComp = null; //right mouseDown occurred on component
   this.mouseOverComp = null; //last component which the mouse moved over
   this.dragComp = null; //component being dragged with left button
   this.lastTouchPos = null; //Track the last touch position
};


CsiMouseEvents.prototype.register_gesture = function (gesture, priority)
{
   if(arguments.length < 2)
   {
      priority = 10;
   }
   gesture.priority = priority;
   this.gestures.push(gesture);
   this.gestures.sort(function (first, second) { return first.priority - second.priority; });
};


CsiMouseEvents.prototype.release_gesture = function (gesture)
{
   var gesture_index = this.gestures.indexOf(gesture);
   if(gesture_index >= 0)
   {
      this.gestures.splice(gesture_index, 1);
   }
};

////////////////////////////////////////////////////////////
// CsiComponent.page_rect
//
// Extends the CsiComponent class by adding a method, pager_rect(), which returns a
// rectangle for this component in page coordinates.
////////////////////////////////////////////////////////////
CsiComponent.prototype.page_rect = function ()
{
   return this.translate_page(
      new Rect(this.left, this.top, this.width, this.height));
};


////////////////////////////////////////////////////////////
// CsiComponent.translate_page
//
// Translates the rectangle or point to page coordinates.
////////////////////////////////////////////////////////////
CsiComponent.prototype.translate_page = function (arg)
{
   var rtn;
   if(arg instanceof Rect)
   {
      rtn = new Rect(
         arg.left + canvasOffsetX,
         arg.top + canvasOffsetY,
         arg.width,
         arg.height);
   }
   else if(arg instanceof Point)
   {
      rtn = new Point(arg.x + canvasOffsetX, arg.y + canvasOffsetY);
   }
   return rtn;
};


////////////////////////////////////////////////////////////
// CsiComponent.translate_canvas
//
// Translates a point or rectangle specified in page coordinates
// to a point or rectangle in canvas coordinates.
////////////////////////////////////////////////////////////
CsiComponent.prototype.translate_canvas = function (arg)
{
   var rtn;
   if(arg instanceof Rect)
   {
      rtn = new Rect(
         arg.left - canvasOffsetX,
         arg.top - canvasOffsetY,
         arg.width,
         arg.height);
   }
   else if(arg instanceof Point)
   {
      rtn = new Point(arg.x - canvasOffsetX, arg.y - canvasOffsetY);
   }
   return rtn;
};



/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiMultiSwitch.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010
Started By: Kevin Westwood

*/

function CsiMultiSwitch(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
   }

   this.needs_mouse_events = true;
   this.set_uri = "";
   this.valueSetter = new CsiValueSetter();
   this.valueSetter.ownerComponent = this;
   this.currValue = null;
   this.targetValue = null;
   this.transparent = false;
   this.write_value = 0.0;

   this.labels = [];
   this.labels_includes_unknown = [];
   this.currLabel = null;
   this.undefinedValue = true;
   this.firstActivate = true;
   this.activating = false;
}

CsiMultiSwitch.prototype = new CsiComponent();


CsiMultiSwitch.prototype.reset_data = function (reset_settings)
{
   this.currValue = null;
   this.targetValue = null;
   this.currLabel = null;
   this.bad_data = true;
   this.nan_data = false;
   this.initializeLabelsToDraw(null);
};


function CsiMultiSwitchLabel(caption, value)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   this.caption = caption;
   this.value = value;
   this.angle = 0;
   this.textAlignment = "center";
   this.textBaseline  = "middle";
}


/*******************************************************************************************
 * addLabel
 *******************************************************************************************/
CsiMultiSwitch.prototype.addLabel = function (caption, value)
{
   this.labels.push(new CsiMultiSwitchLabel(caption, value));
};

/*******************************************************************************************
 * addLabel_unknown
 *******************************************************************************************/
CsiMultiSwitch.prototype.addLabel_unknown = function (caption,
                                                              value)
{
   var newLabel = new CsiMultiSwitchLabel(caption, value);
   this.labels_includes_unknown.push(newLabel);
};



/*******************************************************************************************
 * addRotaryLabel
 *******************************************************************************************/
CsiMultiSwitch.prototype.addRotaryLabel = function (caption,
                                                    value,
                                                    angle_,
                                                    textAlignment_, textBaseline_,
                                                    indicatorPosX_, indicatorPosY_,
                                                    labelPosX_, labelPosY_)
{
   var newLabel = new CsiMultiSwitchLabel(caption, value);
   newLabel.angle = angle_;
   newLabel.textAlignment = textAlignment_;
   newLabel.textBaseline  = textBaseline_;
   newLabel.indicatorPosition = new Point(indicatorPosX_, indicatorPosY_);
   newLabel.labelPosition     = new Point(labelPosX_, labelPosY_);
   this.labels.push(newLabel);
};

/*******************************************************************************************
 * addRotaryLabel_unknown 
 *******************************************************************************************/
CsiMultiSwitch.prototype.addRotaryLabel_unknown  = function (caption,
                                                             value,
                                                             angle_,
                                                             textAlignment_, textBaseline_,
                                                             indicatorPosX_, indicatorPosY_,
                                                             labelPosX_, labelPosY_)
{
   var newLabel = new CsiMultiSwitchLabel(caption, value);
   newLabel.angle = angle_;
   newLabel.textAlignment = textAlignment_;
   newLabel.textBaseline  = textBaseline_;
   newLabel.indicatorPosition = new Point(indicatorPosX_, indicatorPosY_);
   newLabel.labelPosition     = new Point(labelPosX_, labelPosY_);
   this.labels_includes_unknown.push(newLabel);
};


/*******************************************************************************************
 * addSliderSwitchLabel
 *******************************************************************************************/
CsiMultiSwitch.prototype.addSliderSwitchLabel = function (caption,
                                                          value,
                                                          indicatorPosX_, indicatorPosY_,
                                                          labelPosX_, labelPosY_)
{
   var newLabel = new CsiMultiSwitchLabel(caption, value);
   newLabel.indicatorPosition = new Point(indicatorPosX_, indicatorPosY_);
   newLabel.labelPosition     = new Point(labelPosX_, labelPosY_);
   this.labels.push(newLabel);
};

/*******************************************************************************************
 * addSliderSwitchLabel_unknown
 *******************************************************************************************/
CsiMultiSwitch.prototype.addSliderSwitchLabel_unknown = function (caption,
                                                                  value,
                                                                  indicatorPosX_, indicatorPosY_,
                                                                  labelPosX_, labelPosY_)
{
   var newLabel = new CsiMultiSwitchLabel(caption, value);
   newLabel.indicatorPosition = new Point(indicatorPosX_, indicatorPosY_);
   newLabel.labelPosition = new Point(labelPosX_, labelPosY_);
   this.labels_includes_unknown.push(newLabel);
};


CsiMultiSwitch.prototype.activate = function (context)
{
   this.activating = true;
   CsiComponent.prototype.activate.call(this);
   if(this.firstActivate)
   {
      this.firstActivate = false;
      this.initializeLabelsToDraw(null);
      if (this.currLabel !== null)
         this.currAngle = this.currLabel.angle;
   }

   this.newValue(this.currValue);
   this.activating = false;
};


CsiMultiSwitch.prototype.newStringValue = function (value, timestamp, expect_more)
{
   this.newValue(value, timestamp, expect_more);
};


CsiMultiSwitch.prototype.newValue = function (value)
{
   if(this.active)
   {
      if(this.valueSetter.state !== Enum.SetValueState.currentlySetting)
      {
         this.setTargetValue(value);
      }
   }
   else
   {
      this.currValue = value;
   }
};


CsiMultiSwitch.prototype.setTargetValue = function (value)
{
   if(this.targetValue != value) //Leave != for type conversion
   {
      this.targetValue = value;
      this.currLabel = null;
      this.undefinedValue = false;
      this.initializeLabelsToDraw(value);
      this.animating = true;
      this.invalidate();
   }
};


/**********************************************************************************
 * CsiMultiSwitch.initializeLabelsToDraw
 *
 * Fill labelsToDraw array with those labels that will be drawn.  Typically this
 * will be identical to labels.  However, if the value is set to an unknown position,
 * then it will be set to labels_includes_unknown;
 *
 **********************************************************************************/
CsiMultiSwitch.prototype.initializeLabelsToDraw = function(new_value)
{
   this.labelsToDraw = [];

   var i, len;

   //---------------------------------------------------
   // We are going to test for new_value.  Sometimes currLabel can
   // change from labels[] to labels_includes_unknown[]
   //---------------------------------------------------

   // If value is null or undefined (no data from logger yet), default to "0"
   // so the dropdown shows "Select Alarm" instead of ?(null)?
   if (new_value === null || new_value === undefined || new_value === "") {
      new_value = "0";
   }

   // If the pointer needs to point to an unknown value, then pull our
   // positions from the defined labels_includes_unknown.   Otherwise,
   // our positions are indicated in labels.
   // First, see if it's known
   len = this.labels.length;

   this.currLabel = null;
   for (i = 0; i < len; i++)
   {
      if (this.labels[i].value == new_value) {
         this.currLabel = this.labels[i];
      }
   }

   this.undefinedValue = (this.currLabel === null);

   if (this.currLabel !== null || this.hide_unknown)
   {
      for (i = 0; i < len; i++)
         this.labelsToDraw.push(this.labels[i]);
   }
   else
   {
      len = len + 1;
      for (i = 0; i < len; i++)
         this.labelsToDraw.push(this.labels_includes_unknown[i]);

      this.currLabel = this.labelsToDraw[len - 1];
      this.currLabel.caption = "?(" + new_value + ")?";
      this.currLabel.value = new_value;
   }

   if(typeof this.calculatePositions === "function")
      this.calculatePositions();
};


CsiMultiSwitch.prototype.updateAnimation = function ()
{
   this.animating = false;
};


CsiMultiSwitch.prototype.setValueFromIndex = function (index)
{
   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return;
   }

   this.write_value = this.labels[index].value;
   this.setTargetValue(this.write_value);
   this.animating = true;
   this.valueSetter.setValue(this.set_uri, this.write_value);
};


CsiMultiSwitch.prototype.setValueFromLabel = function (label)
{
   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return;
   }

   this.write_value = label.value;
   this.targetValue = label.value;
   this.currLabel   = label;
   this.undefinedValue = false;

   this.initializeLabelsToDraw(label.value);

   //this will ensure that the slider  or rotary switch is moved over to the label
   this.animating = true; 

   this.valueSetter.setValue(this.set_uri, this.write_value);

   this.invalidate();

};


CsiMultiSwitch.prototype.on_set_value_success = function ()
{
   this.newValue(this.valueSetter.write_value);
};


CsiMultiSwitch.prototype.on_set_value_failure = function ()
{
   this.setTargetValue(this.currValue);
};




/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiDropList.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010
Started By: Kevin Westwood

*/

/* global CsiMultiSwitch: true */
/* global CsiMultiSwitchLabel: true */
/* global canvasOffsetX: true */
/* global canvasOffsetY: true */

/* global drawTextWithDecorations */
/* global adjustFontForRect */

/* global getColorAlpha */
/* global setColorAlpha */
/* global fillRoundedRect */


var activeCsiDrop = null; //Global

/***************************************************************************************
 * CsiDropList : Constructor
 *
 ***************************************************************************************/
function CsiDropList(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiMultiSwitch.call(this, left, top, width, height, expression);

   this.hide_arrow = false;
   this.currLabel  = null;
   this.buttonDown = false;
}
CsiDropList.prototype = new CsiMultiSwitch();


/***************************************************************************************
 * CsiDropListLabel : Constructor
 *
 * This class is inherited from the CsiMultiSwitchLabel
 *
 ***************************************************************************************/
function CsiDropListLabel(caption, value, background_, font_, textColor_, fontDecoration_)
{
   if(arguments.length === 0)
   {
      return;
   }

   CsiMultiSwitchLabel.call(this, caption, value);

   this.background = background_;
   this.textFont   = font_;
   this.textColor  = textColor_;
   this.fontDecoration = fontDecoration_;
}

CsiDropListLabel.prototype = new CsiMultiSwitchLabel();


/***************************************************************************************
 * CsiDropList : addLabel, addLabel_unknown
 *
 * Override the addLabel and addLabel_unknown to include the background and font information
 *
 ***************************************************************************************/
CsiDropList.prototype.addLabel = function (caption, value, background_, font_, textColor_, fontDecoration_)
{
   this.labels.push(new CsiDropListLabel(caption, value, background_, font_, textColor_, fontDecoration_));
};

CsiDropList.prototype.addLabel_unknown = function (caption, value, background_, font_, textColor_, fontDecoration_)
{
   this.labels_includes_unknown.push(new CsiDropListLabel(caption, value, background_, font_, textColor_, fontDecoration_));
};

/***************************************************************************************
 * CsiDropListLabel : DrawText
 *
 * Draw the text with this label  information
 *
 ***************************************************************************************/
CsiDropListLabel.prototype.DrawText = function(context, textWidth, textHeight)
{
   context.textAlign    = "center";
   context.textBaseline = "middle";
   context.fillStyle    = this.textColor;

   context.font = this.textFont;
   context.font = adjustFontForRect(context, this.textFont, this.caption, textWidth, textHeight -1, 0, false);

   drawTextWithDecorations(context, this.caption, textWidth / 2, textHeight/2, null, this.fontDecoration);
};

/******************************************************************************
* CsiDropList.drawBackground
* 
* We will over ride the draw button, based on the contenets of our current 
* label switch.  Also, if the button is pressed, we will use different background
* gradients.
* Overwrite  the components to make sure the colors are all right, then call the 
* the original drawBackground
*
******************************************************************************/
CsiDropList.prototype.drawBackground = function (context, rect)
{
   if(this.currLabel) 
   {
      this.backgroundMargin             = this.currLabel.background.backgroundMargin;
      this.eBackgroundBorderStyle       = this.currLabel.background.eBackgroundBorderStyle;
      this.backgroundBorderColor        = this.currLabel.background.backgroundBorderColor;
      this.backgroundBorderThickness    = this.currLabel.background.backgroundBorderThickness;

      this.eBackgroundColorStyle        = this.currLabel.background.eBackgroundColorStyle;
      this.backgroundSolidColor         = this.currLabel.background.backgroundSolidColor;

      this.eBackgroundGradientDirection = this.currLabel.background.eBackgroundGradientDirection;
      this.backgroundGradientStartColor = this.currLabel.background.backgroundGradientStartColor;
      this.backgroundGradientMidColor   = this.currLabel.background.backgroundGradientMidColor;
      this.backgroundGradientEndColor   = this.currLabel.background.backgroundGradientEndColor;
      this.backgroundGradientUseMid     = this.currLabel.background.backgroundGradientUseMid;

      this.bBackgroundRoundedCorners    = this.currLabel.background.bBackgroundRoundedCorners;
      this.backgroundRoundedRadius      = this.currLabel.background.backgroundRoundedRadius;
   }
   else // this.currLabel === null, which is an unknown label. Use the default background
   {
      this.backgroundMargin             = this.default_background.backgroundMargin;
      this.eBackgroundBorderStyle       = this.default_background.eBackgroundBorderStyle;
      this.backgroundBorderColor        = this.default_background.backgroundBorderColor;
      this.backgroundBorderThickness    = this.default_background.backgroundBorderThickness;

      this.eBackgroundColorStyle        = this.default_background.eBackgroundColorStyle;
      this.backgroundSolidColor         = this.default_background.backgroundSolidColor;

      this.eBackgroundGradientDirection = this.default_background.eBackgroundGradientDirection;
      this.backgroundGradientStartColor = this.default_background.backgroundGradientStartColor;
      this.backgroundGradientMidColor   = this.default_background.backgroundGradientMidColor;
      this.backgroundGradientEndColor   = this.default_background.backgroundGradientEndColor;
      this.backgroundGradientUseMid     = this.default_background.backgroundGradientUseMid;

      this.bBackgroundRoundedCorners    = this.default_background.bBackgroundRoundedCorners;
      this.backgroundRoundedRadius      = this.default_background.backgroundRoundedRadius;
   }

   if (this.buttonDown) {

      var rtnRect;
      const bSymetrical =
         (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_GRADIENT &&
         this.backgroundGradientStartColor == this.backgroundGradientEndColor);

      // Gradients need to reverse the gradeint colors if the button is pressed
      if (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_GRADIENT && !bSymetrical) {
         const origBeginColor = this.backgroundGradientStartColor;
         const origEndColor = this.backgroundGradientEndColor;
         this.backgroundGradientStartColor = origEndColor;
         this.backgroundGradientEndColor = origBeginColor;

         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);

         this.backgroundGradientStartColor = origBeginColor;
         this.backgroundGradientEndColor = origEndColor;
      }
         // Solid colors will first draw the solid, then add high lights
      else if (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_SOLID_COLOR || bSymetrical) {

         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);
         const alpha = getColorAlpha(this.backgroundSolidColor) / 255.0 * 0.6;

         const LIGHT_COLOR = "RGBA(255, 255, 255, " + alpha + ")";
         const drawColor = setColorAlpha(this.backgroundSolidColor, alpha);

         //fill with gradient
         let gradient = context.createLinearGradient(rtnRect.left, rtnRect.top, rtnRect.left, rtnRect.bottom);

         gradient.addColorStop(0, drawColor);
         gradient.addColorStop(1, LIGHT_COLOR);

         context.fillStyle = gradient;
         if (this.bBackgroundRoundedCorners)
            fillRoundedRect(context, rtnRect, this.backgroundRoundedRadius);
         else
            context.fillRect(rtnRect.left, rtnRect.top, rtnRect.width, rtnRect.height);
      }
      else {
         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);

      }
      return rtnRect;
   }
   else {
      return CsiComponent.prototype.drawBackground.call(this, context, rect);
   }
};


/***************************************************************************************
 * CsiDropList : draw
 *
 * Draw the text portion and the arrow portion of the drop list.  The background has
 * already been drawn
 ***************************************************************************************/

CsiDropList.prototype.draw = function (context)
{
   context.translate(this.left, this.top); //move to location

   let outerRect = new Rect(0, 0, this.width-1.0, this.height-1.0);
   let textWidth = outerRect.width - 1;

   //draw arrow
   if(!this.hide_arrow)
   {
      if(this.currLabel) 
         context.fillStyle = this.currLabel.textColor;
      else 
        context.fillStyle = "black";
      context.beginPath();
      context.moveTo(outerRect.right - 4,  outerRect.height / 2);
      context.lineTo(outerRect.right - 14, outerRect.height / 2);
      context.lineTo(outerRect.right - 9,  outerRect.height / 2 + 5);
      context.fill();
      textWidth -= 15;
   }

   // draw text
   if(this.currLabel) 
   {
      this.currLabel.DrawText(context, textWidth, this.height);
   }
};


CsiDropList.prototype.deactivate = function ()
{
   CsiComponent.prototype.deactivate.call(this);
   csiMouseEvents.hideMenu();
   this.buttonDown = false;
};


CsiDropList.prototype.OnMenuHidden = function ()
{
   if(activeCsiDrop) 
   {
      this.buttonDown = false;
      activeCsiDrop = null;
      this.refresh();
   }
};


CsiDropList.prototype.OnLButtonClick = function (mouseX, mouseY)
{
   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return false; //allow default behavior
   }

   this.buttonDown = true;
   this.refresh();

   //build menu text
   activeCsiDrop = this;
   var htmlText = "<ul class='context_menu'>";
   var i;
   var len = this.labels.length;
   for(i = 0; i < len; i++)
   {
      htmlText += "<li id=set" + i + " class='menu_item' OnClick=activeCsiDrop.menuItemClicked(" + i + ")>" + this.labels[i].caption + "</li>";
   }
   htmlText += "</ul>";

   $("<div id='context'></div>").html(htmlText)
   .css({
      position: 'absolute',
      zIndex: '9999',
      left: canvasOffsetX + this.left,
      top: canvasOffsetY + this.bottom
   }).show().appendTo('body');

   $('ul.context_menu').css({
      listStyle: 'none',
      padding: '1px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: 'auto'
   });

   $('li.menu_item').mouseover(function ()
   {
      $(this).css({
         backgroundColor: '#E9EFF8'
      });
   }).mouseout(function ()
   {
      $(this).css({
         backgroundColor: 'transparent'
      });
   }).css({
      width: 'auto',
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
   }).click(function ()
   {
      csiMouseEvents.hideMenu();
   });

   return true; //Prevent default behavior
};


CsiDropList.prototype.menuItemClicked = function (index)
{
   this.buttonDown = false;
   csiMouseEvents.hideMenu();
   this.setValueFromIndex(index);
};



/* CsiGestureDoubleTap.js

   Copyright (C) 2013, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Tuesday 08 January 2013

*/

/* global canvasOffsetX: true */
/* global canvasOffsetY: true */

////////////////////////////////////////////////////////////
// class CsiGestureDoubleTap
//
// Defines a class that will recognise a double tap gesture from
// a stream of multitouch events.  
////////////////////////////////////////////////////////////
function CsiGestureDoubleTap()
{
   // the page coordinates over which we will respond to touch events
   this.area = new Rect(0, 0, 100, 100);

   // the radius around the first coordinates.  If the touch moves outside this
   // radius, 
   this.tolerance = 50;

   // the object that will receive touch events
   this.client = null;

   // the maximum amount of time between the touch start and the touch end.
   this.interval = 700;

   // controls whether the component should prevent defaults for touch events
   this.prevent_defaults = false;
   
   // records the state of this recogniser
   this.state = CsiGestureDoubleTap.state_standby;
   this.first_touch = null;
   this.timer_tag = 0;
   this.move_rect = null;
   if(arguments.length >= 1)
   {
      this.client = arguments[0];
      if(arguments.length >= 2)
      {
         var arg1 = arguments[1]; 
         if(arg1 instanceof Rect)
         {
            this.area = new Rect(arg1);
         }
         if(arguments.length >= 3)
         {
            this.interval = Number(arguments[2]);
         }
      }
   }
}
CsiGestureDoubleTap.state_standby = 0;
CsiGestureDoubleTap.state_touched_1 = 1;
CsiGestureDoubleTap.state_released_1 = 2;
CsiGestureDoubleTap.state_touched_2 = 3;


CsiGestureDoubleTap.prototype.on_touch_start = function (event)
{
   var touch;
   var touch_point = null;
   var rtn = this.state !== CsiGestureDoubleTap.state_standby;
   var cancel = false;
   if(this.state === CsiGestureDoubleTap.state_standby)
   {
      if(event.touches.length === 1)
      {
         touch = event.touches[0];
         touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
         if(this.area.contains(touch_point))
         {
            this.first_touch = touch_point;
            ++this.timer_tag;
            oneShotTimer.setTimeout(this, this.timer_tag, this.interval);
            this.state = CsiGestureDoubleTap.state_touched_1;
            this.move_rect = new Rect(0, 0, this.tolerance, this.tolerance);
            this.move_rect.center(touch_point.x, touch_point.y);
            rtn = true;
            csi_log("double tap start first: (" + touch_point.x + "," + touch_point.y + ")");
            if(this.client && typeof this.client.on_double_tap_start === "function")
            {
               this.client.on_double_tap_start(this);
            }
            if(this.prevent_defaults)
            {
               event.preventDefault();
            }
         }
      }
   }
   else if(this.state === CsiGestureDoubleTap.state_touched_1)
   {
      cancel = true;
   }
   else if(this.state === CsiGestureDoubleTap.state_released_1)
   {
      if(event.touches.length === 1)
      {
         touch = event.touches[0];
         touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
         if(this.move_rect.contains(touch_point))
         {
            this.state = CsiGestureDoubleTap.state_touched_2;
            csi_log("double tap start second: (" + touch_point.x + "," + touch_point.y + ")");
            if(this.prevent_defaults)
            {
               event.preventDefault();
            }
         }
         else
         {
            cancel = true;
         }
      }
      else
      {
         cancel = true;
      }
   }
   if(cancel)
   {
      if(this.client && typeof this.client.on_double_tap_cancelled === "function")
      {
         this.client.on_double_tap_cancelled(this);
      }
      oneShotTimer.clearTimeout(this, this.timer_tag);
      this.state = CsiGestureDoubleTap.state_standby;
   }
   return rtn;
};


CsiGestureDoubleTap.prototype.on_touch_move = function(event)
{
   var rtn = this.state !== CsiGestureDoubleTap.state_standby;
   if(this.state === CsiGestureDoubleTap.state_touched_1 ||
      this.state === CsiGestureDoubleTap.state_touched_2)
   {
      var touch = event.touches[0];
      var touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
      if(!this.move_rect.contains(touch_point))
      {
         if(this.client && typeof this.client.on_double_tap_cancelled === "function")
         {
            this.client.on_double_tap_cancelled(this);
         }
         oneShotTimer.clearTimeout(this, this.timer_tag);
         this.state = CsiGestureDoubleTap.state_standby;
      }
   }
   return rtn;
};


CsiGestureDoubleTap.prototype.on_touch_end = function(event)
{
   var rtn = this.state !== CsiGestureDoubleTap.state_standby;
   if(this.state === CsiGestureDoubleTap.state_touched_1)
   {
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
      this.state = CsiGestureDoubleTap.state_released_1;
   }
   if(this.state === CsiGestureDoubleTap.state_touched_2)
   {
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
      oneShotTimer.clearTimeout(this, this.timer_tag);
      this.state = CsiGestureDoubleTap.state_standby;
      rtn = false;
      if(this.client && typeof this.client.on_double_tap_complete === "function")
      {
         this.client.on_double_tap_complete(this);
      }
   }
   return rtn;
};


CsiGestureDoubleTap.prototype.onOneShotTimer = function(tag)
{
   if(this.state !== CsiGestureDoubleTap.state_standby && this.timer_tag === tag)
   {
      if(this.client && typeof this.client.on_double_tap_cancelled === "function")
      {
         this.client.on_double_tap_cancelled(this);
      }
      this.state = CsiGestureDoubleTap.state_standby;
   }
};


CsiGestureDoubleTap.prototype.get_origin = function()
{
   return new Point(
      this.move_rect.left + this.move_rect.width / 2,
      this.move_rect.top + this.move_rect.height / 2);
};



/* CsiGestureTap.js

   Copyright (C) 2013, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Tuesday 08 January 2013

*/

/* global canvasOffsetX: true */
/* global canvasOffsetY: true */


////////////////////////////////////////////////////////////
// class CsiGestureTap
//
// Defines a class that will recognise a single tap gesture from
// a stream of multitouch events.  
////////////////////////////////////////////////////////////
function CsiGestureTap()
{
   // the page coordinates over which we will respond to touch events
   this.area = new Rect(0, 0, 100, 100);

   // the radius around the first coordinates.  If the touch moves outside this
   // radius, 
   this.tolerance = 50;

   // the object that will receive touch events
   this.client = null;

   // the maximum amount of time between the touch start and the touch end.
   this.interval = 500;

   // controls whether the component should prevent defaults for touch events
   this.prevent_defaults = false;
   
   // records the state of this recognizer
   this.state = CsiGestureTap.state_standby;
   this.first_touch = null;
   this.timer_tag = 0;
   this.move_rect = null;
   if(arguments.length >= 1)
   {
      this.client = arguments[0];
      if(arguments.length >= 2)
      {
         var arg1 = arguments[1]; 
         if(arg1 instanceof Rect)
         {
            this.area = new Rect(arg1);
         }
         if(arguments.length >= 3)
         {
            this.interval = Number(arguments[2]);
         }
      }
   }
}
CsiGestureTap.state_standby = 0;
CsiGestureTap.state_touched = 1;
CsiGestureTap.state_after_end = 2;


CsiGestureTap.prototype.on_touch_start = function(event)
{
   var rtn = (this.state !== CsiGestureTap.state_standby);
   if(this.state === CsiGestureTap.state_standby)
   {
      if(event.touches.length === 1)
      {
         var touch = event.touches[0];
         var touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
         if(this.area.contains(touch_point))
         {
            this.first_touch = touch_point;
            ++this.timer_tag;
            oneShotTimer.setTimeout(this, this.timer_tag, this.interval);
            this.state = CsiGestureTap.state_touched;
            this.move_rect = new Rect(0, 0, this.tolerance, this.tolerance);
            this.move_rect.center(touch_point.x, touch_point.y);
            rtn = true;
            if(this.client && typeof this.client.on_single_tap_start === "function")
            {
               this.client.on_single_tap_start(this);
            }
            if(this.prevent_defaults)
            {
               event.preventDefault();
            }
         }
      }
   }
   else if(this.state === CsiGestureTap.state_touched)
   {
      if(this.client && typeof this.client.on_single_tap_cancelled === "function")
      {
         this.client.on_single_tap_cancelled(this);
      }
      oneShotTimer.clearTimeout(this, this.timer_tag);
      this.state = CsiGestureTap.state_standby;
   }
   return rtn;
};


CsiGestureTap.prototype.on_touch_move = function(event)
{
   var rtn = (this.state !== CsiGestureTap.state_standby);
   if(this.state === CsiGestureTap.state_touched)
   {
      var touch = event.touches[0];
      var touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
      if(!this.move_rect.contains(touch_point))
      {
         if(this.client && typeof this.client.on_single_tap_cancelled === "function")
         {
            this.client.on_single_tap_cancelled(this);
         }
         oneShotTimer.clearTimeout(this, this.timer_tag);
         this.state = CsiGestureTap.state_standby;
      }
   }
   return rtn;
};


CsiGestureTap.prototype.on_touch_end = function(event)
{
   var rtn = (this.state !== CsiGestureTap.state_standby);
   if(this.state === CsiGestureTap.state_touched)
   {
      this.state = CsiGestureTap.state_after_end;
      event.preventDefault();
   }
   return rtn;
};


CsiGestureTap.prototype.onOneShotTimer = function(tag)
{
   if(this.timer_tag === tag)
   {
      if(this.state === CsiGestureTap.state_touched)
      {
         if(this.client && typeof this.client.on_single_tap_cancelled === "function")
         {
            this.client.on_single_tap_cancelled(this);
         }
         this.state = CsiGestureTap.state_standby;
      }
      else if(this.state === CsiGestureTap.state_after_end)
      {
         this.state = CsiGestureTap.state_standby;
         if(this.client && typeof this.client.on_single_tap_complete === "function")
         {
            this.client.on_single_tap_complete(this);
         }
      }
   }
};


CsiGestureTap.prototype.get_origin = function()
{
   return new Point(
      this.move_rect.left + this.move_rect.width / 2,
      this.move_rect.top + this.move_rect.height / 2);
};






/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiSwitch.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiGestureTap: true */
/* global CsiGestureDoubleTap: true */
/* global canvasOffsetX: true */
/* global canvasOffsetY: true */


function CsiSwitch(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   this.value = 0.0; //default to 0.0
   this.switchOn = false; //draw on or off
   this.write_value = 0.0;
   this.on_write_value = -1;
   this.off_write_value = 0;
   this.runtime_click_option = Enum.TOGGLE_MOUSE_OPTION.NO_LEFT_CLICK;

   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
   }

   this.needs_mouse_events = true;
   this.set_uri = "";

   this.valueSetter = new CsiValueSetter();
   this.valueSetter.ownerComponent = this;

   this.tap_gesture = new CsiGestureTap(this, new Rect(left, top, width, height));
   this.tap_gesture.prevent_defaults = true;

   this.double_tap_gesture = new CsiGestureDoubleTap(this, new Rect(left, top, width, height));
   this.double_tap_gesture.prevent_defaults = true;
}
CsiSwitch.prototype = new CsiComponent();


CsiSwitch.prototype.newValue = function (value)
{
   // AlarmTrigger must be strictly boolean (0/1). If backend returns an invalid
   // non-zero value (e.g. 2), normalize it and write the corrected value back.
   if(this.set_uri === "Server:CR300Series.Public.AlarmTrigger")
   {
      var normalized_value = (value === 0 || value === 0.0) ? 0 : 1;
      if(value !== 0 && value !== 1 && value !== 0.0 && value !== 1.0 &&
         this.valueSetter.state !== Enum.SetValueState.currentlySetting)
      {
         this.valueSetter.setValue(this.set_uri, normalized_value);
      }
      value = normalized_value;
   }

   //Since we are basically only zero or !zero, just check for those transitions.
   if((this.value === 0.0 && value !== 0.0) || (this.value !== 0.0 && value === 0.0))
   {
      if(this.valueSetter.state !== Enum.SetValueState.currentlySetting)
      {
         this.value = value;
         this.setSwitchOn(this.value !== 0);
      }
   }
};


CsiSwitch.prototype.setSwitchOn = function (switchOn)
{
   this.switchOn = switchOn;
   this.invalidate();
};


CsiSwitch.prototype.on_single_tap_complete = function (gesture)
{
   csiMouseEvents.hideMenu();

   //In a touch environment, we will show the right click menu on a tap unless they have single click enabled
   var pos = gesture.get_origin();
   if(this.runtime_click_option === Enum.TOGGLE_MOUSE_OPTION.SINGLE_LEFT_CLICK)
   {
      this.OnLButtonClick(pos.x, pos.y);
   }
   else
   {
      this.OnRButtonClick(pos.x, pos.y);
   }
};


CsiSwitch.prototype.on_double_tap_complete = function (gesture)
{
   csiMouseEvents.hideMenu();

   var pos = gesture.get_origin();
   if(this.runtime_click_option === Enum.TOGGLE_MOUSE_OPTION.DOUBLE_LEFT_CLICK)
   {
      this.OnLButtonDblClk(pos.x, pos.y);
   }
   else
   {
      this.OnRButtonClick(pos.x, pos.y);
   }
};


CsiSwitch.prototype.OnRButtonClick = function (mouseX, mouseY)
{
   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return;
   }

   var toggle = this;

   $("<div id='context'></div>").html("<ul class='context_menu'><li id='turnon' class='menu_item'>Turn On</li><li id='turnoff' class='menu_item'>Turn Off</li><li id='cancel' class='menu_item'>Cancel</li></ul>")
   .css({
      position: 'absolute',
      zIndex: '9999',
      left: mouseX + canvasOffsetX,
      top: mouseY + canvasOffsetY
   }).show().appendTo('body');

   $('ul.context_menu').css({
      listStyle: 'none',
      padding: '1px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: 'auto'
   });

   $('li.menu_item').mouseover(function ()
   {
      $(this).css({
         backgroundColor: '#E9EFF8'
      });
   }).mouseout(function ()
   {
      $(this).css({
         backgroundColor: 'transparent'
      });
   }).css({
      width: 'auto',
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
   }).click(function ()
   {
      csiMouseEvents.hideMenu();
   });

   $('#turnon').click(function ()
   {
      toggle.turn_on();
   });
   $('#turnoff').click(function ()
   {
      toggle.turn_off();
   });
};


CsiSwitch.prototype.activate = function (context)
{
   CsiComponent.prototype.activate.call(this);
   csiMouseEvents.register_gesture(this.tap_gesture);
   csiMouseEvents.register_gesture(this.double_tap_gesture);
};


CsiSwitch.prototype.deactivate = function ()
{
   CsiComponent.prototype.deactivate.call(this);
   csiMouseEvents.release_gesture(this.tap_gesture);
   csiMouseEvents.release_gesture(this.double_tap_gesture);
   csiMouseEvents.hideMenu();
};


CsiSwitch.prototype.OnLButtonClick = function (mouseX, mouseY)
{
   if(this.runtime_click_option === Enum.TOGGLE_MOUSE_OPTION.SINGLE_LEFT_CLICK)
   {
      if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
      {
         return;
      }

      if(this.value === 0.0)
      {
         this.turn_on();
      }
      else
      {
         this.turn_off();
      }
   }
};


CsiSwitch.prototype.OnLButtonDblClk = function (mouseX, mouseY)
{
   if(this.runtime_click_option === Enum.TOGGLE_MOUSE_OPTION.DOUBLE_LEFT_CLICK)
   {
      if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
      {
         return;
      }

      if(this.value === 0.0)
      {
         this.turn_on();
      }
      else
      {
         this.turn_off();
      }
   }
};


CsiSwitch.prototype.turn_off = function ()
{
   csiMouseEvents.hideMenu();

   if(this.set_uri === "Server:CR300Series.Public.AlarmTrigger")
   {
      // Block manual turn-off from the dashboard while the alarm is active.
      // The switch will automatically enable (turn off) when backend timer hits zero.
      return;
   }

   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return;
   }

   this.setSwitchOn(false);
   this.write_value = this.off_write_value;
   this.valueSetter.setValue(this.set_uri, this.write_value);
};


CsiSwitch.prototype.turn_on = function ()
{
   csiMouseEvents.hideMenu();

   if(this.valueSetter.state === Enum.SetValueState.currentlySetting)
   {
      return;
   }

   this.setSwitchOn(true);
   this.write_value = this.on_write_value;
   if(this.set_uri === "Server:CR300Series.Public.AlarmTrigger")
   {
      this.write_value = (this.write_value === 0 || this.write_value === 0.0) ? 0 : 1;
   }
   this.valueSetter.setValue(this.set_uri, this.write_value);
};


CsiSwitch.prototype.on_set_value_success = function ()
{
   this.newValue(this.valueSetter.write_value);
};


CsiSwitch.prototype.on_set_value_failure = function ()
{
   this.setSwitchOn(this.value !== 0);
};



Enum.TOGGLE_MOUSE_OPTION =
{
   NO_LEFT_CLICK: 0,
   DOUBLE_LEFT_CLICK: 1,
   SINGLE_LEFT_CLICK: 2
};
/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiLeverSwitch.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiSwitch */


function CsiLeverSwitch(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiSwitch.call(this, left, top, width, height, expression);

   this.gradient = null;
}
CsiLeverSwitch.prototype = new CsiSwitch();


CsiLeverSwitch.prototype.draw = function (context)
{
   context.save();

   var rect = new Rect(this.left, this.top, this.width, this.height);

   // Make a square from rect and center it
   var squareSideLength = Math.min(rect.width, rect.height);
   var square = new Rect(0, 0, squareSideLength, squareSideLength);
   square.center(rect.left + rect.width / 2, rect.top + rect.height / 2);

   var r1 = square.width * 3 / 10; // Outermost circle, gray gradient
   var r2 = r1 * 2 / 9; // Inner circle, black
   var r3 = r2 * 4 / 5; // Innermost circle, gray
   var r4y = r3 * 3 / 4; // Thick round-ended line at end of switch, black
   var r4x = r4y * 5 / 3; // Thick round-ended line at end of switch, black

   var centerX = square.get_center().x;
   var centerY = square.get_center().y;

   // If the switch is on we rotate 180 degrees
   if (this.switchOn)
   {
      context.translate(centerX, centerY);
      context.rotate(Math.PI);
      context.translate(-centerX, -centerY);
   }

   // Draw the outermost circle
   var gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, r1);
   gradient.addColorStop(0, "white");
   gradient.addColorStop(1, "rgb(211, 211, 211)");  // RTMC::Color::LightGray
   context.fillStyle = gradient;

   context.beginPath();
   context.ellipse(centerX, centerY, r1, r1, 0, 0, Math.PI * 2);
   context.fill();

   // Draw the inner circle
   context.fillStyle = "black";
   context.beginPath();
   context.ellipse(centerX, centerY, r2, r2, 0, 0, Math.PI * 2);
   context.fill();

   // Draw the innermost circle and the switch stem
   context.lineWidth = r3 * 2;
   context.lineCap = "round";
   context.strokeStyle = "rgb(128, 128, 128)";
   context.beginPath();
   context.moveTo(centerX, centerY);
   context.lineTo(centerX, centerY + r1);
   context.stroke();

   // Draw the outer gradient part of the switch
   var rx1 = r1 * 3 / 5; // Ellipse x-radius
   var ry1 = square.height / 2 - r3 * 5 / 6; // Ellipse y-radius
   var switch_theta1 = -Math.PI / 14; // Angle from center of ellipse to point where we begin drawing
   var switch_theta2 = -Math.PI - switch_theta1; // Angle from center of ellipse to point where we end drawing
   gradient = context.createLinearGradient(centerX - rx1, 0, centerX + rx1, 0);
   gradient.addColorStop(0, "rgb(140, 140, 140)");
   gradient.addColorStop(0.45, "black");
   gradient.addColorStop(1, "black");
   context.fillStyle = gradient;

   context.beginPath();
   context.ellipse(centerX, square.bottom, rx1, ry1, 0, switch_theta1, switch_theta2, true);
   context.fill();

   // Draw the inner gradient part of the switch
   var rx2 = rx1 * 11 / 12;
   var ry2 = square.height / 2 - r1 * 2 / 5;
   gradient = context.createLinearGradient(centerX - rx2, 0, centerX + rx2, 0);
   gradient.addColorStop(0, "black");
   gradient.addColorStop(0.55, "black");
   gradient.addColorStop(1, "rgb(140, 140, 140)");
   context.fillStyle = gradient;

   context.beginPath();
   context.ellipse(centerX, square.bottom, rx2, ry2, 0, switch_theta1, switch_theta2, true);
   context.fill();

   // Draw the black tip of the switch
   var c1 = new Point(centerX + rx1 * Math.cos(-switch_theta2) + r4x, square.bottom + ry1 * Math.sin(switch_theta2));
   context.fillStyle = "black";
   context.beginPath();
   context.ellipse(c1.x, c1.y, r4x, r4y, 0, 0, Math.PI * 2);
   context.fill();

   var c2 = new Point(centerX + rx1 * Math.cos(-switch_theta1) - r4x, square.bottom + ry1 * Math.sin(switch_theta1));
   context.beginPath();
   context.ellipse(c2.x, c2.y, r4x, r4y, 0, 0, Math.PI * 2);
   context.fill();

   context.lineCap = "butt";
   context.lineWidth = r4y * 2;
   context.strokeStyle = "black";
   context.beginPath();
   context.moveTo(c1.x, c1.y);
   context.lineTo(c2.x, c2.y);
   context.stroke();

   context.restore();
};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiHotSpot.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/29/2010
Started By: Kevin Westwood

*/

/* global CsiGestureTap: true */
/* global drawTextWithDecorations */
/* global fillRoundedRect */
/* global getColorAlpha */
/* global setColorAlpha */
/* global getLinesAndFont */


function CsiHotSpot(left, top, width, height)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   this.needs_mouse_events = true;
   this.url = "";
   this.urlTarget = "";
   this.screenIndex = 0;
   this.useUrl = false;
   this.bad_data = false;
   this.tipX = this.left + this.width + 10;
   this.tipY = this.top + 40;

   this.tap_gesture = new CsiGestureTap(this, new Rect(left, top, width, height));
   this.tap_gesture.prevent_defaults = true;

   this.multilines = null;
   this.linesAndFont = null;
   this.buttonDown = false;
}
CsiHotSpot.prototype = new CsiComponent();


CsiHotSpot.prototype.activate = function (context)
{
   CsiComponent.prototype.activate.call(this);
   csiMouseEvents.register_gesture(this.tap_gesture);
};


CsiHotSpot.prototype.deactivate = function ()
{
   CsiComponent.prototype.deactivate.call(this);
   csiMouseEvents.release_gesture(this.tap_gesture);
   csiMouseEvents.hideMenu();
};


CsiHotSpot.prototype.on_single_tap_complete = function (gesture)
{
   var pos = gesture.get_origin();
   this.OnLButtonClick(pos.x, pos.y);
};



/******************************************************************************
* CsiHotSpot.drawBackground
* 
* Buttons will reorganize the gradients if the button is pressed.  Overwrite
* the components to make sure the gradient colors are all right, then call the 
* the original drawBackground
*
******************************************************************************/
CsiHotSpot.prototype.drawBackground = function (context, rect)
{
   if (this.buttonDown) {

      var rtnRect;
      const bSymetrical =
         (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_GRADIENT &&
         this.backgroundGradientStartColor == this.backgroundGradientEndColor);

      // Gradients need to reverse the gradeint colors if the button is pressed
      if (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_GRADIENT && !bSymetrical) {
         const origBeginColor = this.backgroundGradientStartColor;
         const origEndColor = this.backgroundGradientEndColor;
         this.backgroundGradientStartColor = origEndColor;
         this.backgroundGradientEndColor = origBeginColor;

         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);

         this.backgroundGradientStartColor = origBeginColor;
         this.backgroundGradientEndColor = origEndColor;
      }
         // Solid colors will first draw the solid, then add high lights
      else if (this.eBackgroundColorStyle == Enum.BACKGROUND_STYLE.USE_SOLID_COLOR || bSymetrical) {

         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);
         const alpha = getColorAlpha(this.backgroundSolidColor) / 255.0 * 0.6;

         const LIGHT_COLOR = "RGBA(255, 255, 255, " + alpha + ")";
         const drawColor = setColorAlpha(this.backgroundSolidColor, alpha);

         //fill with gradient
         let gradient = context.createLinearGradient(rtnRect.left, rtnRect.top, rtnRect.left, rtnRect.bottom);

         gradient.addColorStop(0, drawColor);
         gradient.addColorStop(1, LIGHT_COLOR);

         context.fillStyle = gradient;
         if (this.bBackgroundRoundedCorners)
            fillRoundedRect(context, rtnRect, this.backgroundRoundedRadius);
         else
            context.fillRect(rtnRect.left, rtnRect.top, rtnRect.width, rtnRect.height);
      }
      else {
         rtnRect = CsiComponent.prototype.drawBackground.call(this, context, rect);

      }
      return rtnRect;
   }
   else {
      return CsiComponent.prototype.drawBackground.call(this, context, rect);
   }
};



/******************************************************************************
* CsiHotSpot.draw
* 
* Draw the text portion of the button
*
******************************************************************************/

CsiHotSpot.prototype.draw = function (context)
{
   context.save();
   context.translate(this.left, this.top); //move to location

   let fillZone = new Rect(0, 0, this.width, this.height);

   // The background should already be drawn.  

   // The background should already be drawn.  
   // We will now draw the text, if needed, testing to see if we need to word wrap
   if (this.buttonText.length > 0) {
      if (this.multilines === null) {
         const margin = 3;
         context.font = this.buttonFont;
         this.linesAndFont = getLinesAndFont(context, this.buttonText, fillZone.width - 2, fillZone.height - 2, margin, true);
         this.multilines = this.linesAndFont.lines;
      }

      context.font = this.linesAndFont.font;
      context.textAlign = "center";
      context.fillStyle = this.buttonTextColor;


      if (this.multilines.length > 1) {
         context.textBaseline = "top";
         const line_count = this.multilines.length;
         const char_height = context.measureText("W").width * 1.5;
         const total_char_height = char_height * line_count;
         let cur_height = fillZone.height / 2 - total_char_height / 2.0;

         for (let i = 0; i < line_count; i++) {
            let cur_line = this.multilines[i];
            var textSize = measureText(context, cur_line);
            textSize.height = textSize.height * 0.65;
            drawTextWithDecorations(context, cur_line, fillZone.width / 2 - 1, cur_height, textSize, this.buttonFontDecoration);
            cur_height += char_height;
         }
      }
      else {
         context.textBaseline = "middle";
         drawTextWithDecorations(context, this.buttonText, fillZone.width / 2 - 1, fillZone.height / 2 - 1, null, this.buttonFontDecoration);
      }
   }

   context.restore();
};


CsiHotSpot.prototype.OnLButtonDown = function (mouseX, mouseY)
{
   this.buttonDown = true;
   this.invalidate(); // We draw the button differently when the button is pressed.
   return true; //Prevent default behavior
};


CsiHotSpot.prototype.OnLButtonUp = function (mouseX, mouseY)
{
   if (this.buttonDown)
   {
      oneShotTimer.setTimeout(this, "ShowTooltip_Remove", 1000); //Hide after 1 sec
      this.buttonDown = false;
      this.invalidate(); // Draw the button in the mouse up state
      this.jump();
   }
};



//CsiHotSpot.prototype.OnLButtonClick = function (mouseX, mouseY)
//{
//   oneShotTimer.setTimeout(this, "ShowTooltip_Remove", 1000); //Hide after 1 sec
//   this.jump();
//};


CsiHotSpot.prototype.jump = function ()
{
   if(this.useUrl)
   {
      if(this.url.length > 0)
      {
         window.open(this.url, this.urlTarget);
      }
   }
   else
   {
      graphicsManager.activateTab(this.screenIndex, true, true);
   }
};


CsiHotSpot.prototype.OnMouseEnter = function (mouseX, mouseY)
{
   document.body.style.cursor = "pointer";
   return true; //Prevent default behavior
};


CsiHotSpot.prototype.OnMouseExit = function ()
{
   CsiComponent.prototype.OnMouseExit.call(this);

   document.body.style.cursor = "default";

   if (this.buttonDown === true)
   {
      this.buttonDown = false;
      this.invalidate(); // We draw the button differently when the button is pressed.
   }


   return true; //Prevent default behavior
};


CsiHotSpot.prototype.OnMouseMove = function (mouseX, mouseY)
{
   CsiComponent.prototype.OnMouseMove.call(this, mouseX, mouseY);
   return true; //Prevent default behavior
};


CsiHotSpot.prototype.onOneShotTimer = function (tag)
{
   CsiComponent.prototype.onOneShotTimer.call(this, tag);
};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiReportHeader.js $

Copyright (C) 2011, 2019 Campbell Scientific, Inc.

Started On: 1/28/2011 7:04:34 AM
Started By: Tyler Mecham

*/

/* global CsiLabel: true */
/* global CsiClockChecker: true */


function CsiReportHeader(left, top, width, height)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   this.textBaseline = "middle";
   this.header_font = "bold 14pt Arial";
   this.header_live_font = "bold 14pt Arial";
   this.header_font_color = "RGBA(0, 0, 0, 1)";
   this.header_live_color = "RGBA(0, 0, 0, 1)";
   this.time_format_string = "%c";
   this.time_live_format_string = "%c";
   this.header_text = "Report Range: %DATE-RANGE%";
   this.header_live_text = "(Report is Live)";
   this.word_wrap = false;

   this.bLiveData = true;

   this.clockChecker = new CsiClockChecker();
   this.clockChecker.ownerComponent = this;

   CsiLabel.call(this, left, top, width, height, "");

   //this.update_header(CsiLgrDate.local(), CsiLgrDate.local(), this.bLiveData);
}

CsiReportHeader.prototype = new CsiLabel();


CsiReportHeader.prototype.on_check_clock_success = function(csiLgrDate)
{
   this.caption = this.header_live_text;

   //var timeOfData = parent -> get_most_recent_time();
   this.caption = this.caption.replace("%LOCAL-TIME%", csiLgrDate.format(this.time_live_format_string));
   //this.caption = this.caption.replace("%MOST-RECENT-TIME%", timeOfData.format(this.time_live_format_string));
   this.multilines = null;
   this.linesAndFont = null;
};


CsiReportHeader.prototype.get_header_str = function ()
{
   let headerText = "";
   let beginDateStr = "";
   let endDateStr   = "";

   if (this.bLiveData) {
      const localTime = CsiLgrDate.local();
      const mostRecentTime = CsiLgrDate.local(); // TODO! parent->get_most_recent_time();

      beginDateStr          = this.begin_date.format(this.time_live_format_string);
      endDateStr            = this.end_date.format(this.time_live_format_string);
      let liveDateStr       = localTime.format(this.time_live_format_string);
      let mostRecentTimeStr = mostRecentTime.format(this.time_live_format_string);

      headerText = this.header_live_text;
      headerText = headerText.replace("%LOCAL-TIME%",       liveDateStr);
      headerText = headerText.replace("%MOST-RECENT-TIME%", mostRecentTimeStr);
   }
   else {
      beginDateStr = this.begin_date.format(this.time_format_string);
      endDateStr   = this.end_date.format(this.time_format_string);

      headerText = this.header_text;
   }

   let dateRangeStr = beginDateStr + " - " + endDateStr;
   headerText = headerText.replace("%DATE-RANGE%",  dateRangeStr);
   headerText = headerText.replace("%BEGIN-DATE%",  beginDateStr);
   headerText = headerText.replace("%END-DATE%",    endDateStr);

   return headerText;
};

CsiReportHeader.prototype.update_header = function (begin_date, end_date, is_report_live)
{
   this.bLiveData = is_report_live;
   this.begin_date = begin_date;
   this.end_date = end_date;

   //Reset the caption so it has unformatted values
   if (this.bLiveData)
   {
      this.clockChecker.checkClock();
   }

   this.caption = this.get_header_str();
   this.multilines = null;
   this.linesAndFont = null;

   if (this.bLiveData) {
      this.font = this.header_live_font;
      this.font_color = this.header_live_color;
      this.fontDecoration = this.header_live_fontDecoration;
   }
   else {
      this.font = this.header_font;
      this.font_color = this.header_font_color;
      this.fontDecoration = this.header_fontDecoration;
   }


   this.invalidate();
};

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiReportRange.js $

Copyright (C) 2011, 2019 Campbell Scientific, Inc.

Started On: 1/28/2011 7:04:34 AM
Started By: Tyler Mecham

*/

/* global CsiReportHeader */
/* global CsiGraph */
/* global CsiGraphXYSeries */
/* global fillRoundedRect */
/* global adjustFontForRect */
/* global drawTextWithDecorations */


function CsiReportRange(left, top, width, height, begin_date, end_date, parent)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiReportHeader.call(this, left, top, width, height);

   //Calculate btn rects
   this.buttons = null;

   this.report_type = Enum.REPORT_TYPES.DURATION;
   this.interval_value = 1;
   this.interval_units = Enum.REPORT_UNITS.DAYS;

   this.duration_seconds = 0;
   this.duration_minutes = 0;
   this.duration_hod = 0;
   this.duration_dom = 0;
   this.duration_dow = Enum.DAY_OF_WEEK.SUN;
   this.duration_month = Enum.MONTH.JAN;

   this.calendar_btn_setting = Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_DATE;

   this.custom_begin_date = CsiLgrDate.fromStr(begin_date);
   this.custom_end_date = CsiLgrDate.fromStr(end_date);
   this.begin_date = CsiLgrDate.local();
   this.end_date = CsiLgrDate.local();

   this.parent = parent;

   //Internal use
   this.search_for_header = !(typeof CsiReportHeader === "undefined" && typeof CsiGraph === "undefined"); //Never search if undefined
   this.report_headers = null;
   this.charts = null;
   this.needs_mouse_events = true;
   this.bad_data = false;
   this.cur_btn_mode = Enum.REPORT_BTN_TYPE.BTN_NONE;
   this.date_changed = false;
   this.sel_year = 0;
   this.sel_month = 0;
   this.allow_click = true;
   this.bLiveData = true;
   this.bAnimating = false;
   this.step_type_setting = Enum.STEP_TYPE_SETTINGS.STEP_CURRENT_RANGE;
   this.step_size_value = 1;
   this.step_size_units = Enum.REPORT_UNITS.WEEKS;

   this.calendarLinesAndFont = null;
   this.stepSizeLinesAndFont = null;
   
   this.arrowBackHighlightDown = null;
   this.arrowBackHighlightUp = null;
   this.pointsBackButton = null;
   this.pointsForwardButton = null;
   this.pointsPlayButton = null;

   this.downButton = Enum.REPORT_BTN_TYPE.BTN_NONE;

   this.ready = false;

   oneShotTimer.setTimeout(this, "SetSupervisor", 10);
}
CsiReportRange.prototype = new CsiComponent();


CsiReportRange.BORDER_COLOR = "#D3D3D3";

/*****************************************************************
 * CsiReportRange::draw
 *
 * Draw the component
 *****************************************************************/
CsiReportRange.prototype.draw = function (context)
{
   if(this.hide_in_runtime)
   {
      return;
   }

   if (this.bShowCurrentTime)
   {
      this.drawCurrentTime(context);
   }

   if (this.buttons === null)
   {
      this.getButtonRects(context);
   }

   this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].bEnabled      = !this.bAnimating;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].bEnabled     = !this.bAnimating;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].bEnabled = !this.bAnimating;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].bEnabled  = !this.bAnimating && !this.bLiveData && this.end_date < CsiLgrDate.local();
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].bEnabled = !this.bAnimating && !this.bLiveData;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].bEnabled = !this.bLiveData && this.end_date < CsiLgrDate.local();

   context.save();
   context.translate(this.left, this.top); //move to location

   this.drawCalendarButton(context);
   this.drawStepSizeButton(context);
   this.drawStepBackwardButton(context);
   this.drawPlayButton(context);
   this.drawStepForwardButton(context);
   this.drawLiveButton(context);

   context.restore();
};



/*****************************************************************
 * CsiReportRange::drawCurrentTime
 *
 * Draw the time at the top of the range, if necessary
 *****************************************************************/
CsiReportRange.prototype.drawCurrentTime = function (context)
{
   let rectText = new Rect(this.left, this.top, this.width, this.height);
   if (this.bShowChooseDate || this.bShowNavigationButtons) {
      rectText.height *= 0.5;
      rectText.updateBottom();
   }

   this.headerText = CsiReportHeader.prototype.get_header_str.call(this);
   if (this.bLiveData)
   {
      context.font = this.header_live_font;
      context.fillStyle = this.header_live_color;

   }
   else
   {
      context.font = this.header_font;
      context.fillStyle = this.header_font_color;
   }
   context.font = adjustFontForRect(context, context.font, this.headerText, rectText.width, rectText.height, 3);

   this.heightHeader = rectText.height;
   let heightOfText = measureText(context, this.headerText).height;
   if (heightOfText + 2 > this.heightHeader)
      this.heightHeader = heightOfText + 2;


   context.textAlign = "center";
   context.textBaseline = "middle";

   const center = rectText.get_center();
   if (this.bLiveData) {
      drawTextWithDecorations(context, this.headerText, center.x, center.y, null, this.header_live_fontDecoration);
   }
   else
   {
      drawTextWithDecorations(context, this.headerText, center.x, center.y, null, this.header_fontDecoration);
   }

};


/*****************************************************************
 * CsiReportRange::drawCalendarButton
 *
 *****************************************************************/
CsiReportRange.prototype.drawCalendarButton = function (context)
{
   if (this.bShowChooseDate) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_CALENDAR;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].rcl, bButtonDown);

      const center = this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].rcl.get_center();
      const width = this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].rcl.width;
      const height = this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].rcl.height;

      /* global adjustFontForRect */
      /* global getLinesAndFont */
      if (this.calendarLinesAndFont === null) {
         context.font = this.calendarFont;
         this.calendarLinesAndFont =
            getLinesAndFont(context, this.calendarText, width - 10, height - 10, 3);
      }


      context.font = this.calendarLinesAndFont.font;
      context.fillStyle = this.arrowColor;
      context.textBaseline = "top";
      context.textAlign = "center";

      const char_size = context.measureText("W").width * 1.05;
      const line_count = this.calendarLinesAndFont.lines.length;

      const total_char_height = char_size * line_count;
      let cur_height = center.y - total_char_height / 2.0;

      for (let i = 0; i < line_count; i++) {
         let cur_line = this.calendarLinesAndFont.lines[i];
         //context.fillText(cur_line, center.x, cur_height);
         drawTextWithDecorations(context, cur_line, center.x, cur_height, null, this.calendarFontDecoration);

         cur_height += char_size;
      }

      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].rcl, bButtonDown);

   }
};

/*****************************************************************
 * CsiReportRange::drawStepSizeButton
 *
 *****************************************************************/
CsiReportRange.prototype.drawStepSizeButton = function (context)
{
   if (this.bShowRuntimeStepButton && this.bShowNavigationButtons) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].rcl, bButtonDown);

      const center = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].rcl.get_center();
      const width = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].rcl.width;
      const height = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].rcl.height;

      /* global adjustFontForRect */
      /* global getLinesAndFont */
      if (this.stepSizeLinesAndFont === null) {
         context.font = this.arrowColor;
         this.stepSizeLinesAndFont =
            getLinesAndFont(context, this.stepSizeText, width - 10, height - 10, 3);
      }


      context.font = this.stepSizeLinesAndFont.font;
      context.fillStyle = this.arrowColor;
      context.textBaseline = "top";
      context.textAlign = "center";

      const char_size = context.measureText("W").width * 1.05;
      const line_count = this.stepSizeLinesAndFont.lines.length;

      const total_char_height = char_size * line_count;
      let cur_height = center.y - total_char_height / 2.0;

      for (let i = 0; i < line_count; i++) {
         let cur_line = this.stepSizeLinesAndFont.lines[i];
         context.fillText(cur_line, center.x, cur_height);         
         cur_height += char_size;
      }


      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].rcl, bButtonDown);

   }
};


/*****************************************************************
 * CsiReportRange::drawStepBackwardButton
 *
* Description:
*    Draw the the "step backward" button
*
*             p0___p1             p0___p1
*              /   /               \    \
*             /   /                 \    \
*           p5    p2                p5    p2
*             \   \                  /    /
*              \   \                /    /
*              p4---p3            p3----p3
*
*****************************************************************/
CsiReportRange.prototype.drawStepBackwardButton = function (context)
{
   if (this.bShowNavigationButtons) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].rcl, bButtonDown);

      if (this.pointsBackButton === null)
      {
         const center = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].rcl.get_center();
         const width  = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].rcl.width;
         const height = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].rcl.height;
         const width_arrow = width / 5;

         let points = [];
         points[0] = new Point(center.x, center.y - height / 4);
         points[1] = new Point(points[0].x + width_arrow, center.y - height / 4);
         points[2] = new Point(center.x - width / 4 + width_arrow, center.y);
         points[3] = new Point(points[1].x, center.y + height / 4);
         points[4] = new Point(points[0].x, center.y + height / 4);
         points[5] = new Point(center.x - width / 4, center.y);

         this.pointsBackButton = points;
      }

      context.beginPath();
      context.moveTo(this.pointsBackButton[0].x, this.pointsBackButton[0].y);
      context.lineTo(this.pointsBackButton[1].x, this.pointsBackButton[1].y);
      context.lineTo(this.pointsBackButton[2].x, this.pointsBackButton[2].y);
      context.lineTo(this.pointsBackButton[3].x, this.pointsBackButton[3].y);
      context.lineTo(this.pointsBackButton[4].x, this.pointsBackButton[4].y);
      context.lineTo(this.pointsBackButton[5].x, this.pointsBackButton[5].y);

      if (this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].bEnabled)
         context.fillStyle = this.arrowColor;
      else
         context.fillStyle = "#808080";
      context.fill();

      context.strokeStyle = "#808080";
      context.stroke();

      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].rcl, bButtonDown);

   }
};



/*****************************************************************
 * CsiReportRange::drawPlayButton
 *
 * Draw the component
 *****************************************************************/
CsiReportRange.prototype.drawPlayButton = function (context)
{
   if (this.bShowPlayButton && this.bShowNavigationButtons) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_PLAY;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].rcl, bButtonDown);

      if (this.pointsPlayButton === null) {
         const center = this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].rcl.get_center();
         const width = this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].rcl.width;
         const height = this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].rcl.height;
         const width_arrow = width / 4;
         const height_arrow = height / 4;

         let points = [];
         points[0] = new Point(center.x - width_arrow, center.y - height_arrow);
         points[1] = new Point(center.x + width_arrow, center.y);
         points[2] = new Point(center.x - width_arrow, center.y + height_arrow);

         this.pointsPlayButton = points;

         points = [];
         points[0] = new Point(center.x - width / 6, center.y - height / 4);
         points[1] = new Point(center.x - width / 6, center.y + height / 4);
         points[2] = new Point(center.x - width / 6 + 4, center.y + height / 4);
         points[3] = new Point(center.x - width / 6 + 4, center.y - height / 4);
            
         this.pointsPauseButton1 = points;
         this.pointsPauseButton2 = points.map(p => { return { x: p.x + width / 3, y: p.y };});
      }

      context.beginPath();
      if (!this.bAnimating) {
         context.moveTo(this.pointsPlayButton[0].x, this.pointsPlayButton[0].y);
         context.lineTo(this.pointsPlayButton[1].x, this.pointsPlayButton[1].y);
         context.lineTo(this.pointsPlayButton[2].x, this.pointsPlayButton[2].y);
      }
      else
      {
         context.moveTo(this.pointsPauseButton1[0].x, this.pointsPauseButton1[0].y);
         context.lineTo(this.pointsPauseButton1[1].x, this.pointsPauseButton1[1].y);
         context.lineTo(this.pointsPauseButton1[2].x, this.pointsPauseButton1[2].y);
         context.lineTo(this.pointsPauseButton1[3].x, this.pointsPauseButton1[3].y);

         context.moveTo(this.pointsPauseButton2[0].x, this.pointsPauseButton2[0].y);
         context.lineTo(this.pointsPauseButton2[1].x, this.pointsPauseButton2[1].y);
         context.lineTo(this.pointsPauseButton2[2].x, this.pointsPauseButton2[2].y);
         context.lineTo(this.pointsPauseButton2[3].x, this.pointsPauseButton2[3].y);
      }

      if (this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].bEnabled)
         context.fillStyle = this.arrowColor;
      else
         context.fillStyle = "#808080";

      context.fill();

      context.strokeStyle = "#808080";
      context.stroke();


      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].rcl, bButtonDown);

   }
   
};


/*****************************************************************
 * CsiReportRange::drawStepForwardButton
 *
 * Draw the component
 *****************************************************************/
CsiReportRange.prototype.drawStepForwardButton = function (context)
{
   if (this.bShowNavigationButtons) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].rcl, bButtonDown);


      if (this.pointsForwardButton === null)
      {
         const center = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].rcl.get_center();
         const width  = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].rcl.width;
         const height = this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].rcl.height;
         const width_arrow = width / 5;

         let points = [];
         points[0] = new Point(center.x - width_arrow, center.y - height / 4);
         points[1] = new Point(center.x, center.y - height / 4);
         points[2] = new Point(center.x + width / 4, center.y);
         points[3] = new Point(points[1].x, center.y + height / 4);
         points[4] = new Point(points[0].x, center.y + height / 4);
         points[5] = new Point(points[2].x - width_arrow, center.y);

         this.pointsForwardButton = points;
      }

      context.beginPath();
      context.moveTo(this.pointsForwardButton[0].x, this.pointsForwardButton[0].y);
      context.lineTo(this.pointsForwardButton[1].x, this.pointsForwardButton[1].y);
      context.lineTo(this.pointsForwardButton[2].x, this.pointsForwardButton[2].y);
      context.lineTo(this.pointsForwardButton[3].x, this.pointsForwardButton[3].y);
      context.lineTo(this.pointsForwardButton[4].x, this.pointsForwardButton[4].y);
      context.lineTo(this.pointsForwardButton[5].x, this.pointsForwardButton[5].y);

      if (this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].bEnabled)
         context.fillStyle = this.arrowColor;
      else
         context.fillStyle = "#808080";
      context.fill();

      context.strokeStyle = "#808080";
      context.stroke();


      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].rcl, bButtonDown);

   }
};

/*****************************************************************
 * CsiReportRange::drawLiveButton
 *
 * Draw the component
 *****************************************************************/
CsiReportRange.prototype.drawLiveButton = function (context)
{
   if (this.bShowNavigationButtons) {
      const bButtonDown = this.downButton == Enum.REPORT_BTN_TYPE.BTN_LIVE;
      this.drawButtonBack(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl, bButtonDown);

      let clippingRect =
         new Rect(this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl.left + 15,
         this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl.top + 13,
         this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl.width - 30,
         this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl.height - 26);
      const center = clippingRect.get_center();

      if (clippingRect.width < 4) {
         clippingRect.left = center.x - 2;
         clippingRect.width = 4;
      }
      if (clippingRect.height < 4) {
         clippingRect.top = center.y - 2;
         clippingRect.height = 4;
      }
      if (this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].bEnabled)
         context.fillStyle = this.arrowColor;
      else
         context.fillStyle = "#808080";
      fillRoundedRect(context, clippingRect, 10);


      context.fillStyle = "RGBA(245, 222, 179, 0.8)";
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.font = this.calendarLinesAndFont.font; 
      context.fillText("LIVE", center.x, center.y);

      this.drawButtonBorder(context, this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].rcl, bButtonDown);

   }
};


/******************************************************************************
* CsiReportRange drawButtonBack
*
* Description:
*    Draw the background image of the button, but make it a little smaller, so we
*    don't draw all the way to the corners, and look funny with the border
******************************************************************************/
CsiReportRange.prototype.drawButtonBack = function (context, rcl, bButtonDown)
{
   if (this.arrowBackHighlightDown === null) {
      this.arrowBackHighlightDown = context.createLinearGradient(0, rcl.top, 0, rcl.bottom);
      this.arrowBackHighlightUp = context.createLinearGradient(0, rcl.top, 0, rcl.bottom);

      let color1 = this.arrowBackColor; //setColorAlpha(this.arrowBackColor, 0.6);
      let color2 = "RGBA(255,255,255,0.6)";

      this.arrowBackHighlightDown.addColorStop(0, color1);
      this.arrowBackHighlightDown.addColorStop(1, color2);

      this.arrowBackHighlightUp.addColorStop(0, color2);
      this.arrowBackHighlightUp.addColorStop(1, color1);
   }

   let smallerRect = new Rect(rcl.left + 5, rcl.top + 5, rcl.width - 10, rcl.height - 10);

   context.fillStyle = this.arrowBackColor;
   fillRoundedRect(context, smallerRect, 5);

   if (bButtonDown)
      context.fillStyle = this.arrowBackHighlightDown;
   else
      context.fillStyle = this.arrowBackHighlightUp;

   fillRoundedRect(context, smallerRect, 5);

};


/******************************************************************************
* CsiReportRange drawButtonBack
*
* Description:
*    Draw the background image of the button, but make it a little smaller, so we
*    don't draw all the way to the corners, and look funny with the border
******************************************************************************/
CsiReportRange.prototype.drawButtonBorder = function (context, rcl, bButtonDown)
{
   var pOuterBrush, pMidBrush, pInnerBrush;

   if (!bButtonDown)
   {
      pOuterBrush = "#808080";
      pMidBrush   = "#ffffff";
      pInnerBrush = "#808080";
   }
   else 
   {      
	  pOuterBrush = "#ffffff";  
      pMidBrush   = "#000000";  
      pInnerBrush = "#808080"; 
   }

   let borderRect = new Rect(rcl.left + 3, rcl.top + 3, rcl.width - 6, rcl.height - 6);
   let outerBorderRect = new Rect(rcl.left + 4, rcl.top + 4, rcl.width - 7, rcl.height - 7);
   let innerBorderRect = new Rect(rcl.left + 2, rcl.top + 2, rcl.width - 5, rcl.height - 5);

   context.lineWidth = 1;
   context.strokeStyle = pOuterBrush;
   drawRoundedRect(context, outerBorderRect, 5);
   context.stroke();
   context.lineWidth = 2;
   context.strokeStyle = pMidBrush;
   drawRoundedRect(context, borderRect, 5);
   context.stroke();
   context.lineWidth = 1;
   context.strokeStyle = pInnerBrush;
   drawRoundedRect(context, innerBorderRect, 5);
   context.stroke();

};

/*****************************************************************
 * CsiReportRange::getButtonRects
 *
 * This is called from the draw function if we need to determine
 * where our buttons should be located.
 *****************************************************************/
CsiReportRange.prototype.getButtonRects = function ()
{
   this.buttons = [];

   const height_margin = this.height * 0.05;
   const bottom_navigation_buttons = this.height - height_margin;
   let top_navigation_buttons = height_margin;

   if (this.bShowCurrentTime) {
      top_navigation_buttons = this.heightHeader;
      if (top_navigation_buttons > bottom_navigation_buttons)
         top_navigation_buttons = bottom_navigation_buttons;
   }

   let buttonRects = [];
   for (let i = 0; i < 7; i++)
      buttonRects[i] = new Rect(0, 0, 0, 0);


   this.numButtons = 0;
   if (this.bShowChooseDate)
      this.numButtons += 1;
   if (this.bShowNavigationButtons)
      this.numButtons += 3;
   if (this.bShowNavigationButtons && this.bShowPlayButton)
      this.numButtons += 1;
   if (this.bShowNavigationButtons && this.bShowRuntimeStepButton)
      this.numButtons += 1;

   if (this.numButtons > 0) {
      const width_margin = this.width * 0.05;
      const width_between_buttons = width_margin / 2.2;
      const all_button_width = this.width - (width_margin * 2);
      const button_width = (all_button_width / this.numButtons) - width_between_buttons;
      const button_height = bottom_navigation_buttons - top_navigation_buttons;

      let left = width_margin + width_between_buttons / 2;

      if (this.bShowChooseDate) {
         buttonRects[Enum.REPORT_BTN_TYPE.BTN_CALENDAR] =
               new Rect(left, top_navigation_buttons, button_width, button_height);
         left += button_width + width_between_buttons;
      }

      if (this.bShowNavigationButtons) {
         if (this.bShowRuntimeStepButton) {
            buttonRects[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE] =
               new Rect(left, top_navigation_buttons, button_width, button_height);
            left += button_width + width_between_buttons;
         }

         buttonRects[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD] =
             new Rect(left, top_navigation_buttons, button_width, button_height);
         left += button_width + width_between_buttons;

         if (this.bShowPlayButton) {
            buttonRects[Enum.REPORT_BTN_TYPE.BTN_PLAY] =
               new Rect(left, top_navigation_buttons, button_width, button_height);
            left += button_width + width_between_buttons;
         }

         buttonRects[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD] =
               new Rect(left, top_navigation_buttons, button_width, button_height);
         left += button_width + width_between_buttons;

         buttonRects[Enum.REPORT_BTN_TYPE.BTN_LIVE] =
             new Rect(left, top_navigation_buttons, button_width, button_height);
         left += button_width + width_between_buttons;
      }
   }

   this.buttons = buttonRects.map(btnsRct =>
   {
      return { bEnabled: true, toolTip: "", rcl: btnsRct };
   });

   if (this.IncludeHoverCaption)
   {
      this.buttons[Enum.REPORT_BTN_TYPE.BTN_NONE].toolTip       = this.HoverCaption;
   }

   this.buttons[Enum.REPORT_BTN_TYPE.BTN_CALENDAR].toolTip      = this.tooltipCalendar;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE].toolTip     = this.tooltipStepSize;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD].toolTip = this.tooltipBack;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_PLAY].toolTip          = this.tooltipPlay;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD].toolTip  = this.tooltipForward;
   this.buttons[Enum.REPORT_BTN_TYPE.BTN_LIVE].toolTip          = this.tooltipLive;

};


/*****************************************************************
 * CsiReportRange::findButton 
 *
 *****************************************************************/
CsiReportRange.prototype.findButton = function (mouseX, mouseY)
{
   const x = mouseX - this.left;
   const y = mouseY - this.top;

   for (let i = 1; i < 7; i++) {
      if (this.buttons[i].bEnabled &&
          this.buttons[i].rcl.left < x &&
          this.buttons[i].rcl.top < y &&
          this.buttons[i].rcl.right > x &&
          this.buttons[i].rcl.bottom > y)
         return i;
   }

   return Enum.REPORT_BTN_TYPE.BTN_NONE;
};



/*****************************************************************
 * CsiReportRange::OnLButtonDown
 *
 *****************************************************************/
CsiReportRange.prototype.OnLButtonDown = function (mouseX, mouseY)
{
   if (this.allow_click === true) {
      this.downButton = this.findButton(mouseX, mouseY);

      oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
      oneShotTimer.clearTimeout(this, "ShowTooltip_Remove");
      $("#tooltip_div").remove();

      this.invalidate(); // We draw the button differently when the button is pressed.

   }
   return true;
};


/*****************************************************************
 * CsiReportRange::OnLButtonUp 
 *
 *****************************************************************/
CsiReportRange.prototype.OnLButtonUp = function (mouseX, mouseY)
{
   if (this.allow_click === true) {
      this.allow_click = false;
      oneShotTimer.setTimeout(this, "EnableClick", 1000);

      const upButton = this.findButton(mouseX, mouseY);

      if (this.downButton === upButton && upButton !== Enum.REPORT_BTN_TYPE.BTN_NONE) {
         this.handle_btn_click(this.downButton);
      }
      this.downButton = Enum.REPORT_BTN_TYPE.BTN_NONE;
      this.invalidate(); // We draw the button differently when the button is pressed.
   }
   return true;
};


/*****************************************************************
 * CsiReportRange::handle_btn_click 
 *
 *****************************************************************/
CsiReportRange.prototype.handle_btn_click = function (clicked_btn)
{
   if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_CALENDAR) {
      this.handle_calendar_click();
   }
   else if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_STEP_SIZE) {
      this.handle_step_click();
   }
   else if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_PLAY) {
      this.handle_play_click();
   }
   else {
      this.calculate_begin_end_date(clicked_btn);
   }
};


/*****************************************************************
 * CsiReportRange::handle_calendar_click 
 *
 *****************************************************************/
CsiReportRange.prototype.handle_calendar_click = function ()
{
   var report_range = this;

   $("#date_picker_apply_btn").unbind("click");
   $("#date_picker_apply_btn").on("click", function (e)
   {
      if (report_range.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_DATE) {
         report_range.begin_date = new CsiLgrDate($("#begindatetimepicker_input").val());
      }
      else if (report_range.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_END_DATE) {
         report_range.end_date = new CsiLgrDate($("#enddatetimepicker_input").val());
      }
      else //Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_END_DATE
      {
         report_range.begin_date = new CsiLgrDate($("#begindatetimepicker_input").val());
         report_range.end_date = new CsiLgrDate($("#enddatetimepicker_input").val());

         // Update this.interval_value, and this.interval_units when the range is adjusted
         report_range.interval_value = (report_range.end_date.milliSecs - report_range.begin_date.milliSecs) / (CsiLgrDate.msecPerSec);
         report_range.interval_units = Enum.REPORT_UNITS.SECONDS;
      }
      report_range.calculate_begin_end_date(Enum.REPORT_BTN_TYPE.BTN_CALENDAR);
      $('#date_picker_modal').modal('hide');
   });

   $('#begindatetimepicker').datetimepicker({
      format: "MM-DD-YYYY HH:mm:ss",
      defaultDate: report_range.begin_date.make_date()
   });

   $('#enddatetimepicker').datetimepicker({
      format: "MM-DD-YYYY HH:mm:ss",
      defaultDate: report_range.end_date.make_date()
   });

   if (this.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_DATE) {
      $("#begin_date_row").removeClass('d-none');
      $("#end_date_row").addClass('d-none');
   }
   else if (this.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_END_DATE) {
      $("#begin_date_row").addClass('d-none');
      $("#end_date_row").removeClass('d-none');
   }
   else //Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_END_DATE
   {
      $("#begin_date_row").removeClass('d-none');
      $("#end_date_row").removeClass('d-none');
   }
   $('#date_picker_modal').modal('show');
};


/*****************************************************************
 * CsiReportRange::handle_step_click 
 *
 *****************************************************************/
CsiReportRange.prototype.handle_step_click = function ()
{
   var report_range = this;

   $("#step_size_apply_btn").unbind("click");
   $("#step_size_apply_btn").on("click", function (e)
   {
      var x = $("#stepSizeValue").val(); // :-)
      var y = Number($("#stepSizeUnits").val()); // :-)

      if ($("#myRadioCurrent:checked").val() == "current_range") {
         report_range.step_type_setting = Enum.STEP_TYPE_SETTINGS.STEP_CURRENT_RANGE;
      }
      else {
         report_range.step_type_setting = Enum.STEP_TYPE_SETTINGS.STEP_CUSTOM_RANGE;
      }
      report_range.step_size_value = $("#stepSizeValue").val();
      report_range.step_size_units = Number($("#stepSizeUnits").val());
      $('#step_size_modal').modal('hide');
   });

   if (this.step_type_setting === Enum.STEP_TYPE_SETTINGS.STEP_CURRENT_RANGE) {
      $("#myRadioCurrent").prop('checked', true);
      $("#customStepDiv").hide(this, "me");
   }
   else //Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_END_DATE
   {
      $("#myRadioCustom").prop('checked', true);
      $("#customStepDiv").show(this, "me");
   }

   $("#stepSizeValue").prop('value', report_range.step_size_value);
   $("#stepSizeUnits").prop('value', report_range.step_size_units);

   $('#step_size_modal').modal('show');
};


/*****************************************************************
 * CsiReportRange::handle_play_click 
 *
 *****************************************************************/
CsiReportRange.prototype.handle_play_click = function ()
{
   this.bAnimating = !this.bAnimating;

   if (!this.bAnimating) {
      this.parent.reportScreenIsAnimating = false;
      oneShotTimer.clearTimeout(this, "LoadNextFrameId");
   }

   else // bAnimating
   {
      this.parent.reportScreenIsAnimating = true;
      oneShotTimer.setTimeout(this, "LoadNextFrameId", 100);
   }
};


/*****************************************************************
 * CsiReportRange::calculate_begin_end_date 
 *
 *****************************************************************/
CsiReportRange.prototype.calculate_begin_end_date = function (clicked_btn, custom_begin, custom_end)
{
   var i = 0;
   var month = 0;
   var year = 0;
   this.cur_btn_mode = clicked_btn;
   this.bLiveData = false;

   var begin_date_ms = this.begin_date.milliSecs;
   var end_date_ms = this.end_date.milliSecs;
   if (custom_begin && custom_end) {
      begin_date_ms = custom_begin.milliSecs;
      end_date_ms = custom_end.milliSecs;
   }
   else {
      if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_CALENDAR) {
         if (this.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_DATE) {
            if (this.report_type !== Enum.REPORT_TYPES.CUSTOM) {
               if (this.interval_units === Enum.REPORT_UNITS.MINUTES) {
                  end_date_ms = begin_date_ms + (this.interval_value * CsiLgrDate.msecPerMin);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.HOURS) {
                  end_date_ms = begin_date_ms + (this.interval_value * CsiLgrDate.msecPerHour);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.DAYS) {
                  end_date_ms = begin_date_ms + (this.interval_value * CsiLgrDate.msecPerDay);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.WEEKS) {
                  end_date_ms = begin_date_ms + (this.interval_value * CsiLgrDate.msecPerWeek);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.MONTHS) {
                  //Flag these as not used
                  begin_date_ms = 0;
                  end_date_ms = 0;
                  this.end_date.milliSecs = this.begin_date.milliSecs;
                  month = this.begin_date.month() + this.interval_value;
                  year = Math.floor(this.begin_date.year() + (month / 13)); //increase the year if we need to
                  month = month % 12; //strip off the months that were added to the year
                  if (month === 0) {
                     month = 12;
                  }
                  this.end_date.setDate(year, month, this.begin_date.day());
               }
               else //REPORT_UNITS::YEARS
               {
                  //Flag these as not used
                  begin_date_ms = 0;
                  end_date_ms = 0;
                  this.end_date.milliSecs = this.begin_date.milliSecs;
                  this.end_date.setDate(this.begin_date.year() + this.interval_value, this.begin_date.month(), this.begin_date.day());
               }
            }
            else //Handle custom
            {
               end_date_ms = begin_date_ms + (this.custom_end_date.milliSecs - this.custom_begin_date.milliSecs);
            }
         }
         else if (this.calendar_btn_setting === Enum.CALENDAR_BTN_SETTINGS.CAL_END_DATE) {
            if (this.report_type !== Enum.REPORT_TYPES.CUSTOM) {
               if (this.interval_units === Enum.REPORT_UNITS.MINUTES) {
                  begin_date_ms = end_date_ms - (this.interval_value * CsiLgrDate.msecPerMin);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.HOURS) {
                  begin_date_ms = end_date_ms - (this.interval_value * CsiLgrDate.msecPerHour);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.DAYS) {
                  begin_date_ms = end_date_ms - (this.interval_value * CsiLgrDate.msecPerDay);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.WEEKS) {
                  begin_date_ms = end_date_ms - (this.interval_value * CsiLgrDate.msecPerWeek);
               }
               else if (this.interval_units === Enum.REPORT_UNITS.MONTHS) {
                  //Flag as unused
                  begin_date_ms = 0;
                  end_date_ms = 0;

                  this.begin_date.milliSecs = this.end_date.milliSecs;
                  month = this.end_date.month() - this.interval_value;
                  year = this.end_date.year();
                  if (month <= 0) //we need to decrement year
                  {
                     year = year - (1 + Math.floor(Math.abs(month) / 13)); //increase the year if we need to
                     month = 12 - (Math.abs(month) % 12); //strip off the months that were subracted from the year
                  }
                  this.begin_date.setDate(year, month, this.end_date.day());
               }
               else //REPORT_UNITS::YEARS
               {
                  //Flag as unused
                  begin_date_ms = 0;
                  end_date_ms = 0;

                  this.begin_date = this.end_date;
                  this.begin_date.setDate(this.end_date.year() - this.interval_value, this.end_date.month(), this.end_date.day());
               }
            }
            else //Handle custom
            {
               begin_date_ms = end_date_ms - (this.custom_end_date.milliSecs - this.custom_begin_date.milliSecs);
            }
         }
         else //Enum.CALENDAR_BTN_SETTINGS.CAL_BEGIN_END_DATE
         {
            //Flag these as not used
            begin_date_ms = 0;
            end_date_ms = 0;
            //Do nothing since both begin and end dates were set in the dialog
         }
      }
      else if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_STEP_BACKWARD) {

         // First calculate how much to move the end date back.
         if (this.step_type_setting === Enum.STEP_TYPE_SETTINGS.STEP_CURRENT_RANGE)
            this.end_date.milliSecs = this.begin_date.milliSecs;
         else
            this.end_date.milliSecs -= this.calculate_ms(this.step_size_value, this.step_size_units, this.end_date, -1);

         end_date_ms = this.end_date.milliSecs;

         // Now calculate the begin date
         if (this.report_type === Enum.REPORT_TYPES.CUSTOM) {
            begin_date_ms = end_date_ms - (this.custom_end_date.milliSecs - this.custom_begin_date.milliSecs);
         }
         else {
            begin_date_ms = end_date_ms - this.calculate_ms(this.interval_value, this.interval_units, this.end_date, -1);
         }
      }
      else if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD) {

         // First calculate how much to move the begin date forward
         if (this.step_type_setting === Enum.STEP_TYPE_SETTINGS.STEP_CURRENT_RANGE)
            this.begin_date.milliSecs = this.end_date.milliSecs;
         else
            this.begin_date.milliSecs += this.calculate_ms(this.step_size_value, this.step_size_units, this.begin_date, 1);

         begin_date_ms = this.begin_date.milliSecs;

         if (this.report_type === Enum.REPORT_TYPES.CUSTOM) {
            end_date_ms = begin_date_ms + (this.custom_end_date.milliSecs - this.custom_begin_date.milliSecs);
         }
         else {
            end_date_ms = begin_date_ms + this.calculate_ms(this.interval_value, this.interval_units, this.begin_date, 1);
         }
      }
      else if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_LIVE) {
         this.bLiveData = true;

         this.begin_date = dataManager.get_server_time();
         this.end_date = dataManager.get_server_time();
         begin_date_ms = this.begin_date.milliSecs;
         end_date_ms = this.end_date.milliSecs;
         if (this.report_type === Enum.REPORT_TYPES.CUSTOM) {
            //If we are using a custom range, and the user hits the live data button,
            //we need to go back and use the original custom range for our interval.  So we will
            //check the current time to see if it is in our current interval and then step forward or back
            //until the current time falls within the custom range.

            //Load up the original dates we loaded from xml
            this.begin_date = this.custom_begin_date;
            begin_date_ms = this.begin_date.milliSecs;
            this.end_date.milliSecs = this.custom_end_date.milliSecs;
            end_date_ms = this.end_date.milliSecs;
            var now_ms = dataManager.get_server_time().milliSecs;
            var diff;
            if (now_ms > begin_date_ms && now_ms <= end_date_ms) {
               //We are in the current window, so we are done
               diff = 0;
            }
            else if (now_ms <= begin_date_ms) {
               //Slide the window back a step until we get inside the window
               diff = end_date_ms - begin_date_ms; //The window size
               while (now_ms <= begin_date_ms) {
                  //still not inside the window, so take another step back in time
                  end_date_ms = begin_date_ms;
                  begin_date_ms -= diff;
               }
            }
            else //now > end_date
            {
               //Slide the window forward a step until we get inside the window
               diff = end_date_ms - begin_date_ms; //The window size
               while (diff !== 0 && now_ms > end_date_ms) {
                  //still not inside the window, so take a step forward in time
                  begin_date_ms = end_date_ms;
                  end_date_ms += diff;
               }
            }
         }
         else {
            if (this.interval_units === Enum.REPORT_UNITS.MINUTES) {
               begin_date_ms -= ((this.interval_value - 1) * CsiLgrDate.msecPerMin);
               this.begin_date = new CsiLgrDate(begin_date_ms);
               this.begin_date.setTime(this.begin_date.hour(), this.begin_date.minute(), this.duration_seconds, 0); //zero out seconds
               end_date_ms = this.begin_date.milliSecs + (this.interval_value * CsiLgrDate.msecPerMin); //Go forward specified minutes
               begin_date_ms = 0; //Set this to 0 since we set the begin_date manually
            }
            else if (this.interval_units === Enum.REPORT_UNITS.HOURS) {
               begin_date_ms -= ((this.interval_value - 1) * CsiLgrDate.msecPerHour);
               this.begin_date = new CsiLgrDate(begin_date_ms);
               this.begin_date.setTime(this.begin_date.hour(), this.duration_minutes, 0, 0);
               end_date_ms = this.begin_date.milliSecs + (this.interval_value * CsiLgrDate.msecPerHour); //Go forward specified minutes
               begin_date_ms = 0; //Set this to 0 since we set the begin_date manually
            }
            else if (this.interval_units === Enum.REPORT_UNITS.DAYS) {
               begin_date_ms -= ((this.interval_value - 1) * CsiLgrDate.msecPerDay);
               this.begin_date = new CsiLgrDate(begin_date_ms);
               this.begin_date.setTime(this.duration_hod, 0, 0, 0);
               end_date_ms = this.begin_date.milliSecs + (this.interval_value * CsiLgrDate.msecPerDay); //Go forward specified hour
               begin_date_ms = 0; //Set this to 0 since we set the begin_date manually
            }
            else if (this.interval_units === Enum.REPORT_UNITS.WEEKS) {
               var cur_dow = this.begin_date.dayOfWeek() - 1; //Zero based day of week 0 = Sunday
               begin_date_ms -= cur_dow * CsiLgrDate.msecPerDay; //make first day of the week

               //Check to see if we need to backup a week to catch the dow specified
               if (cur_dow < this.duration_dow) {
                  begin_date_ms -= CsiLgrDate.msecPerWeek;
               }

               //We should be at Sunday in the week, so add back in the dow offset back in
               begin_date_ms += this.duration_dow * CsiLgrDate.msecPerDay;
               this.begin_date = new CsiLgrDate(begin_date_ms);
               this.begin_date.setTime(0, 0, 0, 0); //zero out the time of the day

               //We should now be at the right day for a 1 week interval.  So offset the number
               //of weeks specified - 1
               begin_date_ms = this.begin_date.milliSecs;
               begin_date_ms -= ((this.interval_value - 1) * CsiLgrDate.msecPerWeek);
               end_date_ms = begin_date_ms + (this.interval_value * CsiLgrDate.msecPerWeek);
            }
            else if (this.interval_units === Enum.REPORT_UNITS.MONTHS) {
               //Check to see if our dom is in the right month
               begin_date_ms = end_date_ms = 0;
               if (this.duration_dom + 1 > this.begin_date.day()) {
                  this.end_date.setDate(this.end_date.year(), this.end_date.month(), this.duration_dom + 1);
                  this.end_date.setTime(0, 0, 0, 0); //zero out the time of the day

                  //If we are in January, rollover the year
                  if (this.end_date.month() === 1) {
                     this.begin_date.setDate(this.end_date.year() - 1, 12, this.end_date.day());
                  }
                  else {
                     this.begin_date.setDate(this.end_date.year(), this.end_date.month() - 1, this.duration_dom + 1);
                  }
                  this.begin_date.setTime(0, 0, 0, 0); //zero out the time of the day
               }
               else {
                  this.begin_date.setDate(this.begin_date.year(), this.begin_date.month(), this.duration_dom + 1);
                  this.begin_date.setTime(0, 0, 0, 0); //zero out the time of the day

                  //If we are in December, rollover the year
                  if (this.begin_date.month() === 12) {
                     this.end_date.setDate(this.begin_date.year() + 1, 1, this.begin_date.day());
                  }
                  else {
                     this.end_date.setDate(this.begin_date.year(), this.begin_date.month() + 1, this.duration_dom + 1);
                  }
                  this.end_date.setTime(0, 0, 0, 0); //zero out the time of the day
               }

               //We should be set at the correct month now, so offset number of months
               //specified - 1
               for (i = 0; i < (this.interval_value - 1) ; ++i) {
                  if (this.begin_date.month() === 1) {
                     this.begin_date.setDate(this.begin_date.year() - 1, 12, this.duration_dom + 1);
                  }
                  else {
                     this.begin_date.setDate(this.begin_date.year(), this.begin_date.month() - 1, this.duration_dom + 1);
                  }
               }
            }
            else //REPORT_UNITS::YEARS
            {
               //Are we in the middle of the interval or do we need to go back a year?
               begin_date_ms = end_date_ms = 0;
               if (this.duration_month + 1 <= this.begin_date.month()) {
                  this.end_date.setDate(this.end_date.year() + 1, this.duration_month + 1, 1);
                  this.end_date.setTime(0, 0, 0, 0); //zero out the time of the day
                  this.begin_date.setDate(this.end_date.year() - this.interval_value, this.duration_month + 1, 1);
                  this.begin_date.setTime(0, 0, 0, 0); //zero out the time of the day
               }
               else {
                  this.begin_date.setDate(this.begin_date.year() - this.interval_value, this.duration_month + 1, 1);
                  this.begin_date.setTime(0, 0, 0, 0); //zero out the time of the day
                  this.end_date.setDate(this.begin_date.year() + this.interval_value, this.duration_month + 1, 1);
                  this.end_date.setTime(0, 0, 0, 0); //zero out the time of the day
               }
            }
         }
      }
   }

   if (begin_date_ms !== 0) {
      this.begin_date = new CsiLgrDate(begin_date_ms);
   }

   if (end_date_ms !== 0) {
      this.end_date = new CsiLgrDate(end_date_ms);
   }

   var query_count = dataManager.webQueries.length;
   var component;
   var var_count;
   var expression;
   for (i = 0; i < query_count; ++i) {
      var query = dataManager.webQueries[i];
      var adjusted_begin = new CsiLgrDate(this.begin_date.milliSecs - query.report_offset);
      if (query.js_name === this.js_name) {
         dataManager.cancel_request(query);
         query.p1 = adjusted_begin.format("%Y-%m-%dT%H:%M:%S.001"); //Make interval (open closed] by adding .001
         if (clicked_btn === Enum.REPORT_BTN_TYPE.BTN_LIVE) {
            query.mode = "since-time";
            query.p2 = "";
         }
         else {
            query.mode = "date-range";
            query.p2 = this.end_date.format("%Y-%m-%dT%H:%M:%S.001"); //Make interval (open closed] by adding .001
         }
         query.order = "collected";

         var_count = query.variables.length;
         var v;
         for (v = 0; v < var_count; v++) {
            expression = query.variables[v].ownerExpression;
            if (expression) {
               expression.reset();
               component = expression.ownerComponent;
               if (component && (typeof component.reset_data === "function")) {
                  var comp_had_bad_data = component.bad_data;
                  component.reset_data(true);
                  component.bad_data = comp_had_bad_data;
               }
            }
         }

         oneShotTimer.setTimeout(dataManager, query, 10); //Force the query to fire immediately
      }
   }

   if (this.report_headers) {
      var len = this.report_headers.length;
      for (i = 0; i < len; i++) {
         this.report_headers[i].update_header(this.begin_date, this.end_date, this.bLiveData);
      }
   }
   else if (this.search_for_header) {
      oneShotTimer.setTimeout(this, "FindReportHeaders", 3);
   }

   this.invalidate();
};


/*****************************************************************
 * CsiReportRange::calculate_ms 
 *
 *****************************************************************/
CsiReportRange.prototype.calculate_ms = function (stepValue, stepUnits, referenceDate, direction)
{
   if (stepUnits === Enum.REPORT_UNITS.SECONDS) {
      return stepValue * CsiLgrDate.msecPerSec;
   }
   else if (stepUnits === Enum.REPORT_UNITS.MINUTES) {
      return stepValue * CsiLgrDate.msecPerMin;
   }
   else if (stepUnits === Enum.REPORT_UNITS.HOURS) {
      return stepValue * CsiLgrDate.msecPerHour;
   }
   else if (stepUnits === Enum.REPORT_UNITS.DAYS) {
      return stepValue * CsiLgrDate.msecPerDay;
   }
   else if (stepUnits === Enum.REPORT_UNITS.WEEKS) {
      return stepValue * CsiLgrDate.msecPerWeek;
   }

   else if (stepUnits === Enum.REPORT_UNITS.MONTHS) {
      let month = referenceDate.month();
      let year  = referenceDate.year();
      let numDays = 0;
      if (direction < 0)
      {
         for (let i = 0; i < stepValue; i++) {
            month = month - 1;
            if (month < 1) {
               year--;
               month = 12;
            }
            numDays += this.get_num_days_in_month(month, year);
         }
      }
      else
      {
         for (let i = 0; i < stepValue; i++) {
            numDays += this.get_num_days_in_month(month, year);
            month = month + 1;
            if (month > 12) {
               year++;
               month = 1;
            }
         }
      }

      return numDays * CsiLgrDate.msecPerDay;
   }
   else //REPORT_UNITS::YEARS
   {
      let numDays = 0;
      let year = referenceDate.year();

      if (direction < 0)
      {
         for (let i = 0; i < stepValue; i++) {
            year += direction;
            numDays += 365 + CsiLgrDate.leap_year(year);
         }
      }
      else
      {
         for (let i = 0; i < stepValue; i++) {
            numDays += 365 + CsiLgrDate.leap_year(year);
            year += direction;
         }
      }

      return numDays * CsiLgrDate.msecPerDay;
   }
};

/*****************************************************************
 * CsiReportRange::get_num_days_in_month 
 *
 *****************************************************************/
CsiReportRange.prototype.get_num_days_in_month = function (month, year)
{
   let numDays = 0;
   switch (month) {
      case 1: numDays = 31; break;
      case 2: numDays = 28 + CsiLgrDate.leap_year(year); break;
      case 3: numDays = 31; break;
      case 4: numDays = 30; break;
      case 5: numDays = 31; break;
      case 6: numDays = 30; break;
      case 7: numDays = 31; break;
      case 8: numDays = 31; break;
      case 9: numDays = 30; break;
      case 10: numDays = 31; break;
      case 11: numDays = 30; break;
      case 12: numDays = 31; break;
   }
   return numDays;
};



CsiReportRange.prototype.on_query_begin = function (query)
{
   if(query.js_name === this.js_name)
   {
      this.update_charts();
   }
};


CsiReportRange.prototype.update_charts = function ()
{
   if(this.charts === null) 
   {
      oneShotTimer.setTimeout(this, "FindReportHeaders", 3);
   }
   else
   {
      var chart_count = this.charts.length;
      var c;
      for(c = 0; c < chart_count; c++)
      {
         if(!this.charts[c].show_restore_btn) //Don't mess up any zooming or panning going on
         {
            this.charts[c].bottomAxis.auto_label = true;
            this.charts[c].bottomAxis.auto_time = false;
            this.charts[c].bottomAxis.auto_min = false;
            this.charts[c].bottomAxis.auto_max = false;
            if(this.charts[c].bottomAxis.inverted)
            {
               this.charts[c].bottomAxis.max = this.begin_date;
               this.charts[c].bottomAxis.min = this.end_date;
            }
            else
            {
               this.charts[c].bottomAxis.max = this.end_date;
               this.charts[c].bottomAxis.min = this.begin_date;
            }
            this.charts[c].displayWidth = this.end_date - this.begin_date;
            this.charts[c].positionsInvalid = true;
            this.invalidate();
         }
      }
   }
};


CsiReportRange.prototype.on_new_data = function (query, record, timestamp)
{
   var rtn = true;
   var adjusted_begin = this.begin_date.milliSecs - query.report_offset;
   if(this.cur_btn_mode === Enum.REPORT_BTN_TYPE.BTN_LIVE)
   {
      if (timestamp.milliSecs > this.end_date.milliSecs)
      {
         rtn = false;
         if (dataManager.get_server_time() > this.end_date.milliSecs) //Don't trigger a restart of live data unless the server time is outside the range as well as the data
         {
            oneShotTimer.setTimeout(this, "TriggerLiveData", 10);
         }
      }
      else if(timestamp.milliSecs < adjusted_begin)
      {
         //Ignore data that is too early
         rtn = false;
      }
   }
   else if(timestamp.milliSecs < adjusted_begin || timestamp.milliSecs > this.end_date.milliSecs)
   {
      //The data is outside the specified range
      rtn = false;
   }

   if(!this.report_headers)
   {
      this.find_delay_comps();
   }
   return rtn;
};

/*****************************************************************
 * CsiReportRange::onOneShotTimer 
 *
 * Called after a brief period of time
 *****************************************************************/
CsiReportRange.prototype.onOneShotTimer = function (tag)
{
   var i = 0;
   if(tag === "EnableClick")
   {
      this.allow_click = true;
   }
   else if(tag === "FindReportHeaders")
   {
      this.find_delay_comps();
   }
   else if(tag === "TriggerLiveData" && this.cur_btn_mode === Enum.REPORT_BTN_TYPE.BTN_LIVE)
   {
      this.calculate_begin_end_date(Enum.REPORT_BTN_TYPE.BTN_LIVE);
   }
   else if(tag === "SetSupervisor")
   {
      var query_count = dataManager.webQueries.length;
      for(i = 0; i < query_count; ++i)
      {
         var query = dataManager.webQueries[i];
         if(query.js_name === this.js_name)
         {
            query.supervisor = this;
         }
      }

      if(this.report_type === Enum.REPORT_TYPES.CUSTOM)
      {
         this.calculate_begin_end_date(Enum.REPORT_BTN_TYPE.BTN_CALENDAR, this.custom_begin_date, this.custom_end_date);
      }
      else
      {
         this.calculate_begin_end_date(Enum.REPORT_BTN_TYPE.BTN_LIVE);
      }

      this.ready = true;
   }
   else if(tag === "LoadNextFrameId")
   {
      if(this.bAnimating)
      {
         this.handle_btn_click(Enum.REPORT_BTN_TYPE.BTN_STEP_FORWARD);
         this.bAnimating = this.end_date < CsiLgrDate.local();

         if (!this.bAnimating) {
            this.parent.reportScreenIsAnimating = false;
            this.handle_btn_click(Enum.REPORT_BTN_TYPE.BTN_LIVE);
         }

         else // bAnimating
            oneShotTimer.setTimeout(this, "LoadNextFrameId", 1000 / this.animationRate);
      }
   }
   else if (tag === "ShowTooltip_Add")
   {
      $("#tooltip_div").remove(); //Fresh start

      var $tip = $('<div />', {
         id: 'tooltip_div',
      });
      $tip.html(this.toolTipCaption);
      $tip.css({
         display: 'none', top: this.tipY, left: this.tipX, position: 'absolute', border: '1px solid black', color: 'black',
         'background-color': '#FFFFE1', padding: '4px', 'border-radius': '0px', 'z-index': '9', 'font-size': '12pt', 'font-weight': '500'
      });
      $tip.appendTo($('#canvas_container'));
      $tip.fadeIn("slow");
   }
   else if (tag === "ShowTooltip_Remove")
   {
      $("#tooltip_div").hide();
      $("#tooltip_div").remove();
   }

};


/*****************************************************************
 * CsiReportRange::find_delay_comps 
 *
 *****************************************************************/
CsiReportRange.prototype.find_delay_comps = function ()
{
   if(graphicsManager.isParentTabReady(this))
   {
      if(this.report_headers === null && this.search_for_header)
      {
         //Check to see if the types are defined
         var csi_report_header_defined = typeof CsiReportHeader !== "undefined";
         var csi_graph_defined = typeof CsiGraph !== "undefined";

         //Initialize both arrays to hold the comps if found
         this.report_headers = [];
         this.charts = [];

         var i = 0;
         var comp_count = this.parent.length;
         for(i = 0; i < comp_count; i++)
         {
            var comp = this.parent[i];
            if(csi_report_header_defined && comp instanceof CsiReportHeader)
            {
               this.report_headers.push(comp);
               comp.update_header(this.begin_date, this.end_date, this.bLiveData);
            }
            else if(csi_graph_defined && comp instanceof CsiGraph)
            {
               var add_chart = true;
               if(comp.seriesarray.length > 0)
               {
                  if(comp.seriesarray[0] instanceof CsiGraphXYSeries)
                  {
                     add_chart = false;
                  }
               }

               if(add_chart)
               {
                  this.charts.push(comp);
               }
            }
         }
      }
      this.update_charts();
   }
   else
   {
      oneShotTimer.setTimeout(this, "FindReportHeader", 3);
   }
};


/*****************************************************************
 * CsiReportRange::OnMouseMove 
 *
 *****************************************************************/
CsiReportRange.prototype.OnMouseMove = function (mouseX, mouseY)
{
   const mouseOverButton = this.findButton(mouseX, mouseY);
   this.toolTipCaption = this.buttons[mouseOverButton].toolTip;

   if (mouseOverButton !== Enum.REPORT_BTN_TYPE.BTN_NONE && this.downButton === Enum.REPORT_BTN_TYPE.BTN_NONE) {
      document.body.style.cursor = "pointer";
   }
   else {
      document.body.style.cursor = "default";
   }

   //if ((mouseOverButton !== this.downButton) && (this.downButton !== Enum.REPORT_BTN_TYPE.BTN_NONE)) {
   //   this.downButton = Enum.REPORT_BTN_TYPE.BTN_NONE;
   //   this.invalidate(); // We draw the button differently when the button is pressed.
   //}

   if (this.toolTipCaption !== "" && this.downButton === Enum.REPORT_BTN_TYPE.BTN_NONE)
   {
      oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
      this.tipX = mouseX + 5;
      this.tipY = mouseY + 15;
      oneShotTimer.setTimeout(this, "ShowTooltip_Add", 1000); //Show if mouse hovers for 1 sec
   }
   else {
      oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
      oneShotTimer.clearTimeout(this, "ShowTooltip_Remove");
      $("#tooltip_div").remove();
   }
   return true; //Prevent default behavior
};



/*****************************************************************
 * CsiReportRange::OnMouseExit 
 *
 *****************************************************************/
CsiReportRange.prototype.OnMouseExit = function ()
{
   document.body.style.cursor = "default";
   oneShotTimer.clearTimeout(this, "ShowTooltip_Add");
   oneShotTimer.clearTimeout(this, "ShowTooltip_Remove");
   $("#tooltip_div").remove();

   if (this.downButton !== Enum.REPORT_BTN_TYPE.BTN_NONE)
   {
      this.downButton = Enum.REPORT_BTN_TYPE.BTN_NONE;
      this.invalidate(); // We draw the button differently when the button is pressed.
   }

   return true; //Prevent default behavior
};

/*****************************************************************
 * CsiReportRange::Constants
 *
 *****************************************************************/

Enum.REPORT_BTN_TYPE =
{
   BTN_NONE: 0,
   BTN_CALENDAR: 1,
   BTN_STEP_SIZE: 2,
   BTN_STEP_BACKWARD: 3,
   BTN_PLAY:4,
   BTN_STEP_FORWARD: 5,
   BTN_LIVE: 6
};


Enum.CALENDAR_BTN_SETTINGS =
{
   CAL_BEGIN_DATE: 0,
   CAL_END_DATE: 1,
   CAL_BEGIN_END_DATE: 2
};

Enum.STEP_TYPE_SETTINGS =
{
   STEP_CURRENT_RANGE: 0,
   STEP_CUSTOM_RANGE: 1,
};

Enum.REPORT_TYPES =
{
   DURATION: 0,
   FIXED_INTERVAL: 1,
   CUSTOM: 2
};


Enum.REPORT_UNITS =
{
   MINUTES:0,
   HOURS: 1,
   DAYS: 2,
   WEEKS: 3,
   MONTHS: 4,
   YEARS: 5,
   SECONDS: 6,
};


Enum.DAY_OF_WEEK =
{
   SUN: 0,
   MON: 1,
   TUE: 2,
   WED: 3,
   THU: 4,
   FRI: 5,
   SAT: 6
};


Enum.MONTH =
{
   JAN: 0,
   FEB: 1,
   MAR: 2,
   APR: 3,
   MAY: 4,
   JUN: 5,
   JUL: 6,
   AUG: 7,
   SEP: 8,
   OCT: 9,
   NOV: 10,
   DEC: 11
};

/* CsiTimeLabel.js

Copyright (C) 2010, 2020 Campbell Scientific, Inc.

*/

/* global CsiLabel: true */
/* global CsiClockChecker: true */
/* global CsiSourceTimeVariable: true */


function CsiTimeLabel(left, top, width, height, source, expression, uri)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }
   CsiLabel.call(this, left, top, width, height, "");

   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
      this.expression = null;
   }

   this.source = source;
   this.uri = uri;
   this.format_string = "%c"; //Short System Default
   this.sync_interval_ms = 1000;

   this.timeOffset = 0;
   
   if(source === Enum.TIME_SOURCE.Current_Server_Time)
   {
      this.source_time_variable = new CsiSourceTimeVariable(uri);
      this.source_time_variable.ownerComponent = this;
   }
   else
   {
      this.clockChecker = new CsiClockChecker();
      this.clockChecker.ownerComponent = this;
   }
   this.lastClockCheck_PcTime = 0;
   this.lastClockCheck_StationTime = 0;
   this.nextClockCheck_PcTime = 0;

   this.textBaseline = "middle";

   this.requestTime();
}
CsiTimeLabel.prototype = new CsiLabel();


CsiTimeLabel.prototype.setLgrDate = function (csiLgrDate)
{
   if(csiLgrDate) 
   {
      var adj_time = new CsiLgrDate(csiLgrDate.milliSecs + this.timeOffset);
      if (this.format_string.search("%") !== -1) {
         this.caption = adj_time.format(this.format_string);
      } else {
         this.caption = this.csFormat(adj_time);
      }
   }
   else
   {
      if (this.format_string.search("%") !== -1) {
         this.caption = new CsiLgrDate(0).format(this.format_string);
      } else {
         this.caption = this.csFormat(new CsiLgrDate(0));
      }
   }
   this.invalidate();
};


CsiTimeLabel.prototype.csFormat = function (time) {
 
   var fmt = this.format_string;
   var jsdate = time.make_date();

   var flagged_hour_pos = fmt.search("hh");
   var hour = time.hour() % 12;
   var hourstr = hour.toString();
   var hour_s = "";
   if (flagged_hour_pos > -1) {
      hour_s = hourstr;
      if (hour < 10) {
         hour_s = "0" + hourstr;
      }
      fmt = fmt.replace(new RegExp("hh", "g"), hour_s);
   }

   flagged_hour_pos = fmt.search("h");
   hourstr = hour.toString();
   if (flagged_hour_pos > -1) {
      hour_s = hourstr;
      if (hour < 10) {
         hour_s = "0" + hourstr;
      }
      fmt = fmt.replace(new RegExp("h", "g"), hour_s);
   }

   flagged_hour_pos = fmt.search("HH");
   hourstr = hour.toString();
   if (flagged_hour_pos > -1) {
      hour_s = hourstr;
      if (hour < 10) {
         hour_s = "0" + hourstr;
      }
      fmt = fmt.replace(new RegExp("HH", "g"), hour_s);
   }

   flagged_hour_pos = fmt.search("H");
   hourstr = hour.toString();
   if (flagged_hour_pos > -1) {
      hour_s = hourstr;
      if (hour < 10) {
         hour_s = "0" + hourstr;
      }
      fmt = fmt.replace(new RegExp("H", "g"), hour_s);
   }

   var flagged_min_pos = fmt.search("mm");
   var minstr = time.minute().toString();
   if (flagged_min_pos > -1) {
      var min_s = "0".repeat(2 - minstr.length) + minstr;
      fmt = fmt.replace(new RegExp("mm", "g"), min_s);
   }
   flagged_min_pos = fmt.search("m");
   if (flagged_min_pos > -1)
      fmt = fmt.replace(new RegExp("m", "g"), minstr);

   var flagged_sec_pos = fmt.search("ss");
   var secstr = time.second().toString();
   if (flagged_sec_pos > -1) {
      var sec_s = "0".repeat(2 - secstr.length) + secstr;
      fmt = fmt.replace(new RegExp("ss", "g"), sec_s);
   }
   flagged_sec_pos = fmt.search("s");
   if (flagged_sec_pos > -1) {
      fmt = fmt.replace(new RegExp("s", "g"), secstr);
   }

   var flagged_UTZOffset_pos = fmt.search("zzz");
   var gmt_offset = time.gmt_offset() / CsiLgrDate.msecPerMin;
   var UTZOff_s = "";
   if (flagged_UTZOffset_pos > -1) {
      if (gmt_offset < 0) {
         UTZOff_s = "-";
      }
      UTZOff_s += CsiLgrDate.pad_zero(Math.abs(gmt_offset / 60), 2) + ":" + CsiLgrDate.pad_zero(gmt_offset % 60, 2);
      fmt = fmt.replace(new RegExp("zzz", "g"), UTZOff_s);
   }
   flagged_UTZOffset_pos = fmt.search("zz");
   if (flagged_UTZOffset_pos > -1) {
      if (gmt_offset < 0) {
         UTZOff_s = "-";
      }
      UTZOff_s += CsiLgrDate.pad_zero(Math.abs(gmt_offset) / 60, 2);
      fmt = fmt.replace(new RegExp("zz", "g"), UTZOff_s);
   }
   flagged_UTZOffset_pos = fmt.search("z");
   if (flagged_UTZOffset_pos > -1) {
      UTZOff_s = (gmt_offset) / 60;
      fmt = fmt.replace(new RegExp("z", "g"), UTZOff_s);
   }

   // Create a loop and remove one "F" from the string with each iteration
   var flagged_fraction_pos;
   var FStr = "FFFFFFFFF";
   var nsec = time.msec() * CsiLgrDate.nsecPerMSec;
   var nSecStr = nsec.toString();
   for (var i = FStr.length; i > 0; i--) {
      FStr = FStr.substr(0, i);
      flagged_fraction_pos = fmt.search(FStr);
      if (flagged_fraction_pos > -1) {
         nSecStr = nSecStr.substr(0, i);
         fmt = fmt.replace(new RegExp(FStr, "g"), nSecStr);
      }
   }
   // same again with "f"
   FStr = "fffffffff";
   nSecStr = nsec.toString();
   for (i = FStr.length; i > 0; i--) {
      FStr = FStr.substr(0, i);
      flagged_fraction_pos = fmt.search(FStr);
      if (flagged_fraction_pos > -1) {
         nSecStr = nSecStr.substr(0, i);
         fmt = fmt.replace(new RegExp(FStr, "g"), nSecStr);
      }
   }

   var flagged_g_pos = fmt.search("gg");
   if (flagged_g_pos > -1) {
      if (time.year() > 0) {
         fmt = fmt.replace("gg", "CE");
      } else {
         fmt = fmt.replace("gg", "BCE");
      }
   }

   flagged_g_pos = fmt.search("g");
   if (flagged_g_pos > -1) {
      if (time.year > 0) {
         fmt = fmt.replace("g", "AD");
      } else {
         fmt = fmt.replace("g", "BC");
      }
   }

   var temp;

   if (fmt.search("j") > -1) {
      fmt = fmt.replace("j", CsiLgrDate.pad_zero(time.dayOfYear(), 3));
   }

   var yStr = "yyyy";
   var ys;
   var YearStr = time.year().toString();
   for (i = yStr.length; i > 0; i--) {
      yStr = yStr.substr(0, i);
      flagged_fraction_pos = fmt.search(yStr);
      if (flagged_fraction_pos > -1) {
         ys = YearStr.substr(4 - i, i);
         fmt = fmt.replace(new RegExp(yStr, "g"), ys);
      }
   }

   yStr = "YYYY";
   YearStr = time.year().toString();
   for (i = yStr.length; i > 0; i--) {
      yStr = yStr.substr(0, i);
      flagged_fraction_pos = fmt.search(yStr);
      if (flagged_fraction_pos > -1) {
         ys = YearStr.substr(4 - i, i);
         fmt = fmt.replace(new RegExp(yStr, "g"), ys);
      }
   }

   fmt = fmt.replace("dddd", "#_#_#_#_");
   fmt = fmt.replace("ddd", "#_#_#_");
   fmt = fmt.replace("dd", "#_#_");
   fmt = fmt.replace("d", "#_");

   var flagged_mon_pos = fmt.search("MMMM");
   if (flagged_mon_pos > -1) {
      temp = time.format("%B");
      fmt = fmt.replace("MMMM", temp);
   }
   flagged_mon_pos = fmt.search("MMM");
   if (flagged_mon_pos > -1) {
      temp = time.format("%b");
      fmt = fmt.replace("MMM", temp);
   }
   flagged_mon_pos = fmt.search("MM");
   var monthstr = time.month().toString();
   if (flagged_mon_pos > -1) {
      day_s = "0".repeat(2 - monthstr.length) + monthstr;
      fmt = fmt.replace(new RegExp("MM", "g"), day_s);
   }
   flagged_mon_pos = fmt.search("M");
   monthstr = time.month().toString();
   if (flagged_mon_pos > -1) {
      fmt = fmt.replace(new RegExp("M", "g"), monthstr);
   }

   var flagged_tt_pos = fmt.search("tt");
   if (flagged_tt_pos > -1) {
      temp = time.format("%p");
      fmt = fmt.replace("tt", temp);
   }
   flagged_tt_pos = fmt.search("t");
   if (flagged_tt_pos > -1) {
      temp = time.format("%p");
      fmt = fmt.replace("t", temp);
   }

   // Day: dddd, ddd, dd, d
   var flagged_day_pos = fmt.search("#_#_#_#_");
   var daystr = time.day().toString();
   if (flagged_day_pos > -1) {
      temp = time.format("%A");
      fmt = fmt.replace("#_#_#_#_", temp);
   }
   flagged_day_pos = fmt.search("#_#_#_");
   if (flagged_day_pos > -1) {
      temp = time.format("%a");
      fmt = fmt.replace("#_#_#_", temp);
   }
   flagged_day_pos = fmt.search("#_#_");
   var day_s;
   if (flagged_day_pos > -1) {
      day_s = "0".repeat(2 - daystr.length) + time.day();
      fmt = fmt.replace(new RegExp("#_#_", "g"), day_s);
   }
   flagged_day_pos = fmt.search("#_");
   if (flagged_day_pos > -1)
      fmt = fmt.replace(new RegExp("#_", "g"), daystr);

   var flagged_K_pos = fmt.search("K");
   if (flagged_K_pos > -1) {
      temp = jsdate.toTimeString();
      var time_zone_pos = temp.lastIndexOf(" GMT");
      if (time_zone_pos >= 0)
         fmt = fmt.replace(new RegExp("K", "g"), temp.slice(time_zone_pos, temp.length));
   }

   return fmt;

};


CsiTimeLabel.prototype.newStringValue = function (value, timestamp, expect_more)
{
   this.newValue(value, timestamp, expect_more);
};


//newData will be called if an expression is assigned. Source should be:
//Enum.TIME_SOURCE.Time_Value, expression contains timestamp variable
//Enum.TIME_SOURCE.Server_Time_On_Last_Data_Collection_From_Station expression contains "__statistics__.<loggername>.Last Data Collection"
//Station_Time: expression contains "__statistics__.<loggername>.Last Clock Check", (can be updated if a clock schedule is set up)
CsiTimeLabel.prototype.newValue = function (value, timestamp, expect_more)
{
   //the value is a timestamp
   if(!expect_more)
   {
      var new_caption = null;
      if(value === null) 
      {
         if (this.format_string.search("%") !== -1) {
            new_caption = new CsiLgrDate(0).format(this.format_string);
         } else {
            new_caption = this.csFormat(new CsiLgrDate(0));
         }
      }
      else
      {
         try
         {
            if(value instanceof CsiLgrDate)
            {
               this.setLgrDate(value);
            }
            else if(typeof value === "string")
            {
               var date = new Date(value);
               if(isFinite(date)) 
               {
                  this.setLgrDate(new CsiLgrDate(date));
               }
               else
               {
                  new_caption = value;
               }
            }
            else if(typeof value === "boolean")
            {
               if(value === true)
               {
                  new_caption = "true";
               }
               else
               {
                  new_caption = "false";
               }
            }
            else
            {
               new_caption = value.toFixed(this.precision);
            }
         }
         catch(exception)
         {
            if (this.format_string.search("%") !== -1) {
               new_caption = new CsiLgrDate(0).format(this.format_string);
            } else {
               new_caption = this.csFormat(new CsiLgrDate(0));
            }
         }

         if(new_caption && new_caption !== this.caption)
         {
            this.caption = new_caption;
            this.invalidate();
         }
      }
   }
};


//source should be Enum.TIME_SOURCE.Data_Time_In_Last_Record_From_Table
CsiTimeLabel.prototype.newRecord = function (jsonRecord, timestamp, expect_more)
{
   if(this.source === Enum.TIME_SOURCE.Data_Time_In_Last_Record_From_Table)
   {
      this.setLgrDate(timestamp);
   }
};


CsiTimeLabel.prototype.delayedRequestTime = function ()
{
   oneShotTimer.setTimeout(this, null, 1000);
};


CsiTimeLabel.prototype.onOneShotTimer = function (tag)
{
   this.requestTime();
};


CsiTimeLabel.prototype.requestTime = function ()
{
   switch(this.source)
   {
      case Enum.TIME_SOURCE.PC_Time:
         this.setLgrDate(CsiLgrDate.local());
         this.delayedRequestTime();
         break;
      case Enum.TIME_SOURCE.Current_Server_Time:
         this.setLgrDate(this.source_time_variable.get_value());
         this.delayedRequestTime();
         break;
      case Enum.TIME_SOURCE.Station_Time:
         var pcTime = CsiLgrDate.local();

         //update estimated time
         if(this.lastClockCheck_PcTime > 0)
         {
            this.setLgrDate(new CsiLgrDate(this.lastClockCheck_StationTime + (pcTime - this.lastClockCheck_PcTime)));
         }

         //check clock?
         if(pcTime.valueOf() >= this.nextClockCheck_PcTime.valueOf())
         {
            this.clockChecker.checkClock(this.uri);
         }
         else
         {
            this.delayedRequestTime();
         }
         break;
      default:
         break;
   }
};


CsiTimeLabel.prototype.on_check_clock_success = function (csiLgrDate)
{
   this.lastClockCheck_PcTime = CsiLgrDate.local(); //current pc time
   this.lastClockCheck_StationTime = csiLgrDate.valueOf();  //station time
   this.nextClockCheck_PcTime = this.lastClockCheck_PcTime + this.sync_interval_ms; //next clock check time
   this.setLgrDate(csiLgrDate);
   this.delayedRequestTime();
};


CsiTimeLabel.prototype.on_check_clock_failure = function ()
{
   this.setLgrDate(null);
   this.delayedRequestTime();
};

/* CsiGestureSwipe.js

   Copyright (C) 2013, 2019 Campbell Scientific, Inc.

   Written by: Jon Trauntvein 
   Date Begun: Tuesday 08 January 2013

*/

/* global canvasOffsetX: true */
/* global canvasOffsetY: true */

////////////////////////////////////////////////////////////
// class CsiGestureSwipe
//
// Defines an object that will recognize a swipe gesture within
// a specified area based upon a stream of touch events.  
////////////////////////////////////////////////////////////
function CsiGestureSwipe()
{
   // the page coordinates over which we will respond to touch events
   this.area = new Rect(0, 0, 100, 100);

   // the object that will receive swipe events
   this.client = null;

   // controls whether the component should prevent defaults for touch events
   this.prevent_defaults = false;

   // initialize members that will maintain the state of this gesture
   this.state = CsiGestureSwipe.state_standby;
   this.origin = null;
   if(arguments.length >= 1)
   {
      this.client = arguments[0];
      if(arguments.length >= 2)
      {
         var arg1 = arguments[1];
         if(arg1 instanceof Rect)
         {
            this.area = new Rect(arg1);
         }
      }
   }
}
CsiGestureSwipe.state_standby = 0;
CsiGestureSwipe.state_touched = 1;
CsiGestureSwipe.state_moving = 2;


CsiGestureSwipe.prototype.on_touch_start = function(event)
{
   var rtn = (this.state !== CsiGestureSwipe.state_standby);
   if(this.state === CsiGestureSwipe.state_standby)
   {
      if(event.touches.length === 1)
      {
         var touch = event.touches[0];
         var touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
         if(this.area.contains(touch_point))
         {
            this.origin = touch_point;
            this.state = CsiGestureSwipe.state_touched;
            rtn = true;
            if(this.client && typeof this.client.on_swipe_start === "function")
            {
               this.client.on_swipe_start(this);
            }
            if(this.prevent_defaults)
            {
               event.preventDefault();
            }
         }
      }
   }
   else
   {
      // any other touch start event when we are already started should reset us to a standby state.
      if(this.client && typeof this.client.on_swipe_cancelled === "function")
      {
         this.client.on_swipe_cancelled(this);
      }
      this.state = CsiGestureSwipe.state_standby;
   }
   return rtn;
};


CsiGestureSwipe.prototype.on_touch_move = function (event)
{
   var rtn = (this.state !== CsiGestureSwipe.state_standby);
   var touch = 0;
   var touch_point = 0;
   var delta_x = 0;
   var delta_y = 0;
   if(this.state === CsiGestureSwipe.state_touched)
   {
      var move_rect = new Rect(0, 0, this.tolerance, this.tolerance);
      touch = event.touches[0];
      touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
      delta_x = touch_point.x - this.origin.x;
      delta_y = touch_point.y - this.origin.y;
      this.state = CsiGestureSwipe.state_moving;
      this.last_touch = touch_point;
      if(this.client && typeof this.client.on_swipe_moved === "function")
      {
         this.client.on_swipe_moved(this, delta_x, delta_y);
      }
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
   }
   else if(this.state === CsiGestureSwipe.state_moving)
   {
      touch = event.touches[0];
      touch_point = new Point(touch.pageX - canvasOffsetX, touch.pageY - canvasOffsetY);
      delta_x = touch.pageX - this.last_touch.x;
      delta_y = touch.pageY - this.last_touch.y;
      this.last_touch.x = touch.pageX;
      this.last_touch.y = touch.pageY;
      if(this.client && typeof this.client.on_swipe_moved === "function")
      {
         this.client.on_swipe_moved(this, delta_x, delta_y);
      }
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
   }
   return rtn;
};


CsiGestureSwipe.prototype.on_touch_end = function(event)
{
   var rtn = (this.state !== CsiGestureSwipe.state_standby);
   if(this.state === CsiGestureSwipe.state_touched)
   {
      this.state = CsiGestureSwipe.state_standby;
      if(this.client && typeof this.client.on_swipe_cancelled === "function")
      {
         this.client.on_swipe_cancelled(this);
      }
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
   }
   else if(this.state === CsiGestureSwipe.state_moving)
   {
      this.state = CsiGestureSwipe.state_standby;
      if(this.client && typeof this.client.on_swipe_complete === "function")
      {
         this.client.on_swipe_complete(this);
      }
      if(this.prevent_defaults)
      {
         event.preventDefault();
      }
   }  
   return rtn;
};


CsiGestureSwipe.prototype.get_origin = function ()
{
   return this.origin;
};



/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiTable.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.

Started On: 10/5/2010 7:51:33 AM
Started By: Kevin Westwood

*/

/* global CsiGestureTap: true */
/* global CsiGestureSwipe: true */
/* global canvasOffsetX: true */
/* global canvasOffsetY: true */
/* global getGradient: true */
/* global drawTextWithDecorations */
/* global fillRoundedRect */

/************************************************************************************
 * CsiTable: Constants
 *
 ************************************************************************************/
Enum.ScrollBarBtn =
{
   NONE: -1,
   HSCROLLER: 4,
   VSCROLLER: 5
};


Enum.ColDataTypes =
{
   DATE: 0,
   FLOAT: 1,
   STRING: 2,
   INT: 3,
   BOOL: 4,
   OTHER: 5
};

var SCROLL_BTN_SIZE = 15.0;  //global

/************************************************************************************
 * CsiTable: Constructor
 *
 ************************************************************************************/
function CsiTable(left, top, width, height, expression)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);

   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
   }

   this.maxRecords = 1000;
   this.timestampFormat = "%c";
   this.timeOffset = 0;
   this.newDataAtTop = false;
   this.showRecordNumber = false;
   this.showAllColumns = true;
   this.tableFilter = [];
   this.customHeadings = [];
   this.customPrecisions = [];
   this.font = "10pt Arial";

   //Internal use
   this.current_row = null;
   this.filter_index = null;
   this.table_count = 0;
   this.col_exp_array = [];
   this.fixed_table_header = [];
   this.col_types = [];
   this.rows = [];
   this.row_height = 0;
   this.top_row = 0;
   this.left_col = 0;
   this.col_count = 0;
   this.col_widths = [];
   this.measured_col_widths = [];
   this.col_char_counts = [];
   this.margin = 5;
   this.needs_hscrollbar = false;
   this.needs_vscrollbar = false;
   this.tableHeight = height;
   this.max_visible_rows = Number.MAX_VALUE;
   this.needs_mouse_events = true;
   this.defaultPrecision = 1;
   this.precisions = [];
   this.totalScrollCols = 0;
   this.size_hscrollbar_pos = 2;
   this.size_vscrollbar_pos = 2;
   this.scrollXPosPercent = 0.0;
   this.scrollYPosPercent = 0.0;
   this.totalColumnWidth = 0;
   this.buttonDown = false;
   this.scroll_btn = Enum.ScrollBarBtn.NONE;



   this.pan_gesture = new CsiGestureSwipe(this, new Rect(left, top, width, height));
   this.pan_gesture.prevent_defaults = true;

   this.tap_gesture = new CsiGestureTap(this, new Rect(left, top, width, height));
   this.tap_gesture.prevent_defaults = true;
}
CsiTable.prototype = new CsiComponent();



function CsiColumnExpressionComp(col_name, expression, ownerComponent)
{
   this.ownerComponent = ownerComponent;

   if(expression)
   {
      this.expression = expression;
      this.expression.ownerComponent = this;
   }
   else
   {
      this.expression = null;
   }

   this.col_name = col_name;
   this.bad_data = true;
   this.nan_data = false;
   this.col_index = -1; //Index into the displayed columns
}


CsiColumnExpressionComp.prototype.newNanValue = function(value, timestamp, expect_more)
{
   var nan_value;
   if(value === -Infinity)
   {
      nan_value = "-INF";
   }
   else if(value === Infinity)
   {
      nan_value = "INF";
   }
   else
   {
      nan_value = "NAN";
   }

   this.newStringValue(nan_value, timestamp, expect_more);
};


CsiColumnExpressionComp.prototype.newValue = function(rec_value, timestamp, expectMore)
{
   if(this.col_index >= 0 && this.ownerComponent.current_row)
   {
      var col_offset = 1;
      if(this.ownerComponent.showRecordNumber)
         col_offset = 2;

      var col_value;
      var col_type = this.ownerComponent.col_types[this.col_index - col_offset];
      try
      {
         if(col_type === Enum.ColDataTypes.DATE)
         {
            col_value = CsiLgrDate.fromStr(rec_value).format(this.ownerComponent.timestampFormat);
         }
         else if(col_type === Enum.ColDataTypes.FLOAT)
         {
            col_value = sprintf("%.*f", this.ownerComponent.precisions[this.col_index - col_offset], rec_value);
         }
         else if(col_type === Enum.ColDataTypes.INT)
         {
            col_value = rec_value.toLocaleString();
         }
         else if(col_type === Enum.ColDataTypes.BOOL)
         {
            col_value = (rec_value ? "True" : "False");
         }
         else
         {
            col_value = String(rec_value);
         }
      }
      catch(exception)
      {
         col_value = "";
      }
      
      this.newStringValue(col_value, timestamp, expectMore);
   }
};


/************************************************************************************
 * CsiTable: newStringValue
 *
 ************************************************************************************/
CsiColumnExpressionComp.prototype.newStringValue = function(rec_value, timestamp, expectMore)
{
   if(this.col_index >= 0 && this.ownerComponent.current_row)
   {
      var col_offset = 1;
      if(this.ownerComponent.showRecordNumber)
         col_offset = 2;

      this.ownerComponent.current_row[this.col_index] = String(rec_value);

      //Check each column to see if we need to take a new measurement
      if(this.ownerComponent.current_row[this.col_index].length > this.ownerComponent.col_char_counts[this.col_index])
      {
         graphicsManager.context.save();
         graphicsManager.context.font = this.contentFont;
         let col_width = graphicsManager.context.measureText(this.ownerComponent.current_row[this.col_index]).width + 2 * this.ownerComponent.margin;
         graphicsManager.context.restore();
         if(col_width > this.ownerComponent.measured_col_widths[this.col_index])
         {
            this.ownerComponent.measured_col_widths[this.col_index] = col_width;
            this.ownerComponent.col_widths[this.col_index] = col_width;
         }

         var col_length = this.ownerComponent.current_row[this.col_index].length;
         if(col_length > this.ownerComponent.col_char_counts[this.col_index])
         {
            this.ownerComponent.col_char_counts[this.col_index] = col_length;
         }
      }

      this.measureScrollBars();

      this.invalidate();
   }
};


CsiColumnExpressionComp.prototype.invalidate = function()
{
   this.ownerComponent.valid = false;
   graphicsManager.componentInvalidate(this.ownerComponent);
};


CsiTable.prototype.createColumnExpressionComp = function(col_name, expression)
{
   var col_exp = new CsiColumnExpressionComp(col_name, expression, this);
   this.col_exp_array.push(col_exp);
   return col_exp;
};


/************************************************************************************
 * CsiTable: tableDefs
 *
 * We have just received our table definions
 *
 ************************************************************************************/
CsiTable.prototype.tableDefs = function(jsonHead)
{
   this.current_row = null;
   var f = 0;
   var j = 0;
   var i = 0;

   //Reset the index of all the expression columns
   var total_col_exp = this.col_exp_array.length;
   for(j = 0; j < total_col_exp; j++)
   {
      this.col_exp_array[j].col_index = -1;
   }

   this.fixed_table_header = [];
   this.col_types = [];

   //add fixed header cells
   var total_col_count = jsonHead.fields.length;

   if (this.showTimestamp)
   {
      if(this.timestampFormat.length === 0)
      {
         this.fixed_table_header.push("");
      }
      else
      {
         this.fixed_table_header.push("Timestamp");
      }
   }
   if(this.showRecordNumber)
   {
      this.fixed_table_header.push("Record #");
   }

   if(this.showAllColumns)
   {
      for(j = 0; j < total_col_count; j++)
      {
         //Look for a custom heading label
         if(jQuery.type(this.customHeadings[jsonHead.fields[j].name]) !== "undefined")
         {
            this.fixed_table_header.push(this.customHeadings[jsonHead.fields[j].name]);
         }
         else
         {
            this.fixed_table_header.push(jsonHead.fields[j].name);
         }

         this.col_types.push(this.get_type(jsonHead.fields[j].type));

         //set the precisions if they exist
         if(jQuery.type(this.customPrecisions[jsonHead.fields[j].name]) !== "undefined")
         {
            this.precisions.push(parseInt(this.customPrecisions[jsonHead.fields[j].name], 10));
         }
         else
         {
            this.precisions.push(this.defaultPrecision);
         }
      }
   }
   else
   {
      this.filter_index = [];
      //Put all the filters in the header
      var flen = this.tableFilter.length;
      for(f = 0; f < flen; f++)
      {
         var found = false;
         for(j = 0; j < total_col_count && !found; j++)
         {
            if(this.tableFilter[f] === jsonHead.fields[j].name)
            {
               //Look for a custom heading label
               if(jQuery.type(this.customHeadings[jsonHead.fields[j].name]) !== "undefined")
               {
                  this.fixed_table_header.push(this.customHeadings[jsonHead.fields[j].name]);
               }
               else
               {
                  this.fixed_table_header.push(jsonHead.fields[j].name);
               }

               //set the precisions if they exist
               if(jQuery.type(this.customPrecisions[jsonHead.fields[j].name]) !== "undefined")
               {
                  this.precisions.push(parseInt(this.customPrecisions[jsonHead.fields[j].name], 10));
               }
               else
               {
                  this.precisions.push(this.defaultPrecision);
               }

               //Cache the index for fast lookup
               this.col_types.push(this.get_type(jsonHead.fields[j].type));
               this.filter_index[f] = j;
               found = true;
            }
         }
      }
   }

   //First let's try to match the column titles for the index.  This only fails if custom headings are used.
   this.col_count = this.fixed_table_header.length;
   for(f = 0; f < this.col_count; f++)
   {
      //Assign the index of the column expression comps
      for(i = 0; i < total_col_exp; i++)
      {
         //Is the col_index uninitialized?
         if(this.col_exp_array[i].col_index === -1)
         {
            if(this.col_exp_array[i].col_name === this.fixed_table_header[f])
            {
               this.col_exp_array[i].col_index = f;
               break;
            }
            else if(jQuery.type(this.customHeadings[this.col_exp_array[i].col_name]) !== "undefined")
            {
               //Try to find the matching column title from the customHeading
               if(this.customHeadings[this.col_exp_array[i].col_name] === this.fixed_table_header[f])
               {
                  this.col_exp_array[i].col_index = f;
                  break;
               }
            }
         }
      }
   }
   //See if we need to pick out any custom headings for the expression index.
   for(i = 0; i < total_col_exp; i++)
   {
      if(this.col_exp_array[i].col_index === -1) //Still no index so check custom headings
      {
         if(jQuery.type(this.customHeadings[this.col_exp_array[i].col_name]) !== "undefined")
         {
            this.col_exp_array[i].col_index = i;
         }
      }
   }

   graphicsManager.context.save();
   graphicsManager.context.font = this.contentFont;
   const contentsFontHeight = graphicsManager.context.measureText("W").width * 1.5 + 2 * this.margin;
   graphicsManager.context.font = this.headingFont;
   const headingFontHeight = graphicsManager.context.measureText("W").width * 1.5 + 2 * this.margin;
   graphicsManager.context.restore();

   if(headingFontHeight < contentsFontHeight)
   {
      this.row_height = contentsFontHeight;
   }
   else
   {
      this.row_height = headingFontHeight;
   }


   //Height - fixed header and then minus hscroll if needed
   this.max_visible_rows = parseFloat((((this.height - this.row_height - (this.needs_hscrollbar ? SCROLL_BTN_SIZE : 0)) / this.row_height) - 1).toFixed(0));

   //default the col widths to the column headings
   graphicsManager.context.save();
   graphicsManager.context.font = this.headingFont;
   for(i = 0; i < this.col_count; i++)
   {
      this.col_char_counts[i] = 0;
      this.measured_col_widths[i] = graphicsManager.context.measureText(this.fixed_table_header[i]).width + 2 * this.margin;
      this.col_widths[i] = this.measured_col_widths[i];
}


   graphicsManager.context.restore();

   this.measureScrollBars();
   this.invalidate();
};


/************************************************************************************
 * CsiTable: newRecord
 *
 * We have just received a new record of data
 *
 ************************************************************************************/
CsiTable.prototype.newRecord = function(jsonRecord, timestamp, expect_more)
{
   var value_count = jsonRecord.vals.length;
   var rec_value;

   //add the row
   this.current_row = [];
   if(this.showTimestamp)
   {
      let offset_timestamp = new CsiLgrDate(timestamp.milliSecs + this.timeOffset);
      this.current_row.push(offset_timestamp.format(this.timestampFormat));
   }

   if(this.showRecordNumber)
   {
      this.current_row.push(jsonRecord.no.toLocaleString());
   }

   if(this.showAllColumns)
   {
      for(let i = 0; i < value_count; i++)
      {
         rec_value = jsonRecord.vals[i];
         if(this.col_types[i] === Enum.ColDataTypes.DATE)
         {
            this.current_row.push(CsiLgrDate.fromStr(rec_value).format(this.timestampFormat));
         }
         else if(this.col_types[i] === Enum.ColDataTypes.FLOAT)
         {
            if(rec_value === -Infinity || rec_value === "-INF")
            {
               this.current_row.push("-INF");
            }
            else if(rec_value === Infinity || rec_value === "+INF")
            {
               this.current_row.push("+INF");
            }
            else if(isNaN(rec_value))
            {
               this.current_row.push("NAN");
            }
            else
            {
               this.current_row.push(sprintf("%.*f", this.precisions[i], rec_value));
            }
         }
         else if(this.col_types[i] === Enum.ColDataTypes.STRING)
         {
            this.current_row.push(rec_value);
         }
         else if(this.col_types[i] === Enum.ColDataTypes.INT)
         {
            this.current_row.push(rec_value.toLocaleString());
         }
         else if(this.col_types[i] === Enum.ColDataTypes.BOOL)
         {
            this.current_row.push(rec_value ? "True" : "False");
         }
         else
         {
            this.current_row.push(String(rec_value));
         }
      }
   }
   else if(this.filter_index)
   {
      var flen = this.tableFilter.length;
      //check to see if it passes the filter
      for(let i = 0; i < flen; i++)
      {
         rec_value = jsonRecord.vals[this.filter_index[i]];
         if(this.col_types[i] === Enum.ColDataTypes.DATE)
         {
            this.current_row.push(CsiLgrDate.fromStr(rec_value).format(this.timestampFormat));
         }
         else if(this.col_types[i] === Enum.ColDataTypes.FLOAT)
         {
            if(rec_value === -Infinity)
            {
               this.current_row.push("-INF");
            }
            else if(rec_value === Infinity)
            {
               this.current_row.push("INF");
            }
            else if(isNaN(rec_value))
            {
               this.current_row.push("NAN");
            }
            else
            {
               this.current_row.push(sprintf("%.*f", this.precisions[i], rec_value));
            }
         }
         else if(this.col_types[i] === Enum.ColDataTypes.STRING)
         {
            this.current_row.push(rec_value);
         }
         else if(this.col_types[i] === Enum.ColDataTypes.INT)
         {
            this.current_row.push(rec_value.toLocaleString());
         }
         else if(this.col_types[i] === Enum.ColDataTypes.BOOL)
         {
            this.current_row.push(rec_value ? "True" : "False");
         }
         else
         {
            this.current_row.push(String(rec_value));
         }
      }
   }

   for(let i = 0; i < this.col_count; i++)
   {
      //Check each column to see if we need to take a new measurement
      if(this.current_row[i])
      {
         if(this.current_row[i].length > this.col_char_counts[i])
         {
            graphicsManager.context.save();
            graphicsManager.context.font = this.contentFont;
            let width = graphicsManager.context.measureText(this.current_row[i]).width + 2 * this.margin;
            graphicsManager.context.restore();

            if (width > this.measured_col_widths[i])
               this.measured_col_widths[i] = width;
            this.col_char_counts[i] = this.current_row[i].length;
         }
      }
      else
      {
         if(this.col_types[i] === Enum.ColDataTypes.DATE)
         {
            this.measured_col_widths[i] = 0;
            this.col_char_counts[i] = 0;
         }
      }
   }

   if(this.newDataAtTop)
   {
      this.rows.unshift(this.current_row);
   }
   else
   {
      this.rows.push(this.current_row);
   }

   if(!expect_more)
   {
      var rows_to_remove = this.rows.length - this.maxRecords;
      if(rows_to_remove > 0)
      {
         if(this.newDataAtTop)
         {
            this.rows.splice(this.maxRecords, rows_to_remove);
         }
         else
         {
            this.rows.splice(0, rows_to_remove);
         }
      }

      this.measureScrollBars();

      this.invalidate();
   }
};


/************************************************************************************
 * CsiTable: measureScrollBars
 *
 * Calculates if the scroll bars should be visible, and how big to make the 
 * scroll bar grab bar at the bottom.  This should be called when the col_widths[..] 
 * change
 *
 * Input:
 *      measured_col_widths[..]
 *  
 * Output:
 *       col_widths
 *       needs_hscrollbar
 *       size_hscrollbar_pos
 *       size_vscrollbar_pos
 *       totalScrollCols
 ************************************************************************************/
CsiTable.prototype.measureScrollBars = function()
{
   //-------------------------------------------------------------------------
   // Calulate the horizontal scroll bar information.  This will calculate
   //   1) If the scrollbar is needed (needs_hscrollbar)
   //   2) how large to make our scroll bar handle at the bottom (size_hscrollbar_pos)
   //   3) how many columns we are scrolling, so that we don't scroll off the right too much (totalScrollCols)
   //-------------------------------------------------------------------------
   this.totalColumnWidth = 0;
   for(let i = 0; i < this.col_count; i++)
   {
      this.totalColumnWidth += this.measured_col_widths[i];
      this.col_widths[i] = this.measured_col_widths[i];
   }

   // See if we need a horizontal scroll bar.  If we have a vertical scroll bar, stop the
   // horizontal bar just to the left of the v scroll bar.
   let scrollBarWidth = this.width - (this.needs_vscrollbar ? SCROLL_BTN_SIZE : 0);
   
   if(this.totalColumnWidth > scrollBarWidth)
   {
      this.needs_hscrollbar = true;

      // Calculate the width of the scrollbar postion marker.
      let widthPercent = scrollBarWidth / this.totalColumnWidth;

      // convert it to pixels
      let maxWidth = scrollBarWidth * 0.9;
      let minWidth = SCROLL_BTN_SIZE;
      if (minWidth >= maxWidth)
         minWidth = maxWidth * 0.9;

      this.size_hscrollbar_pos = widthPercent * (maxWidth - minWidth) + minWidth;
      
      this.totalScrollCols = this.col_widths.length;

      let right_col_width = 0;
      if (this.showTimestamp)
         right_col_width += this.col_widths[0];
      for (let i = this.col_widths.length - 1; i >= 0; i--)
      {
         right_col_width += this.col_widths[i];
         if (right_col_width < scrollBarWidth)
            this.totalScrollCols --;
         else
            break;
      }
   }
   else
   {
      this.needs_hscrollbar = false;
   }


   //-------------------------------------------------------------------------
   // Now calculate the vertical scroll bar information 
   //-------------------------------------------------------------------------
   if(this.rows.length > this.max_visible_rows)
   {

      this.needs_vscrollbar = true;

      // Calculate the height of the scrollbar postion marker.
      // Shrink the bar at the bottom, so that we stop short of the horizontal bar, and don't include the title row.
      let scrollBarHeight = this.tableHeight - this.row_height - (this.needs_hscrollbar ? SCROLL_BTN_SIZE : 0);
      let heightPercent = scrollBarHeight / (this.rows.length * this.row_height);
      
      // convert it to pixels
      let maxHeight = scrollBarHeight * 0.9;
      let minHeight = SCROLL_BTN_SIZE;
      if (minHeight >= maxHeight)
         minHeight = maxHeight * 0.9;

      this.size_vscrollbar_pos = heightPercent * (maxHeight - minHeight) + minHeight;

   }
   else
   {
      this.needs_vscrollbar = false;
   }


   //-------------------------------------------------------------------------
   // Test corner cases, where the addition of a scroll bar means that we may need
   // to add another scroll bar
   //-------------------------------------------------------------------------
   if (this.needs_vscrollbar && !this.needs_hscrollbar && 
      (this.totalColumnWidth > this.width - SCROLL_BTN_SIZE))
   {
      this.needs_hscrollbar = true;
      this.measureScrollBars();
      return;
   }


   // Stretch to the right, if necessary
   if (this.totalColumnWidth < scrollBarWidth)
   {
      let  extraPad = (scrollBarWidth - this.totalColumnWidth) / this.col_widths.length;

      for (let i = 0; i < this.col_widths.length; i++)
      {
         this.col_widths[i] += extraPad;
      }
      this.totalColumnWidth = scrollBarWidth;
   }
};

/************************************************************************************
 * CsiTable: GetTableGradient
 *
 * return the gradient necessary for drawing the table bacground
 ************************************************************************************/
CsiTable.prototype.GetTableGradient = function(context, bgProps, rect)
{
   let myFillStyle;
   switch (bgProps.eBackgroundColorStyle)
   {
      case Enum.BACKGROUND_STYLE.USE_SOLID_COLOR:
         myFillStyle = bgProps.backgroundSolidColor;
         break;

      case Enum.BACKGROUND_STYLE.USE_GRADIENT:
         myFillStyle = getGradient(context, rect, 
            bgProps.eBackgroundGradientDirection, 
            bgProps.backgroundGradientStartColor,
            bgProps.backgroundGradientMidColor, 
            bgProps.backgroundGradientEndColor, 
            bgProps.backgroundGradientUseMid);
         break;
   }
   return myFillStyle;
};

/************************************************************************************
 * CsiTable: Draw
 *
 * draw the table
 ************************************************************************************/
CsiTable.prototype.draw = function(context)
{
   context.save();
   context.translate(this.left, this.top); //move to location

   context.lineCap = "butt";
   context.lineJoin = "miter";
   context.lineWidth = 1;

   //-------------------------------------------------------------------------
   // We many need to shrink the table from the original component size
   //-------------------------------------------------------------------------
   this.tableHeight = this.height;
   if(this.col_count > 0 && this.rows.length < this.max_visible_rows)
   {
      this.tableHeight = 
         (this.row_height * (this.rows.length + 1)) + 
         (this.needs_hscrollbar ? SCROLL_BTN_SIZE : 0);
   }

   //-------------------------------------------------------------------------
   // Fill in the background for the header row and fixed columns
   //-------------------------------------------------------------------------
   let headerRect  = new Rect(0, 0, this.width, this.tableHeight);
   if(this.col_count > 0)
   {
      // if there is no left hand column, create the fill style gradient with only the top rect
      if (!this.showTimestamp) {
         headerRect.height = this.row_height;
         headerRect.updateBottom();
      }

      //Retrieve the gradient, using the given rectangle
      context.fillStyle = this.GetTableGradient(context, this.headerBackground, headerRect);
      
      // Now fill in the top of the table
      headerRect.height = this.row_height;
      headerRect.updateBottom();
      context.fillRect(headerRect.left, headerRect.top, headerRect.width, headerRect.height);

      // Fill in the side row of the column
      if (this.showTimestamp) {
         headerRect.top = this.row_height;
         headerRect.height = this.tableHeight - this.row_height;
         headerRect.width = this.col_widths[0];

         context.fillRect(headerRect.left, headerRect.top, headerRect.width, headerRect.height);
      }

   }


   //-------------------------------------------------------------------------
   // Now fill in the content background 
   //-------------------------------------------------------------------------
   let contentRect = new Rect(0, 0, this.width, this.tableHeight);
   context.fillStyle = this.GetTableGradient(context, this.contextBackground, contentRect);

   if (this.col_count > 0)
   {
      contentRect.top     = this.row_height;  
      contentRect.height -= this.row_height;

      if (this.showTimestamp) {
         contentRect.left  += this.col_widths[0];
         contentRect.width -= this.col_widths[0];
      }
   }

   context.fillRect(contentRect.left, contentRect.top, contentRect.width, contentRect.height);

   //-------------------------------------------------------------------------
   // Fill in the text
   //-------------------------------------------------------------------------
   if(this.col_count > 0)
   {
      //----------------------------------------------------------
      // Draw the lines around the columns first
      //----------------------------------------------------------
      this.draw_column_lines(context);

      //----------------------------------------------------------
      // Draw fixed header labels
      //----------------------------------------------------------
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.font = this.headingFont;
      context.fillStyle = this.headingFontColor;

      var cur_y = this.row_height / 2.0 - this.margin;
      this.draw_row(context, this.fixed_table_header, cur_y, this.headingFontDecoration); //Always draw this row at top
      cur_y += this.row_height;

      //----------------------------------------------------------
      // Draw all the data rows
      //----------------------------------------------------------
      var total_row_count = this.rows.length;
      var row_index;
      
      context.font = this.contentFont;
      context.fillStyle = this.contentFontColor;
      
      for(row_index = this.top_row; row_index < total_row_count && cur_y <= this.tableHeight; row_index++)
      {
         this.draw_row(context, this.rows[row_index], cur_y, this.contentFontDecoration);
         cur_y += this.row_height;
      }

      //----------------------------------------------------------
      // Draw the scroll bars
      //----------------------------------------------------------
      this.draw_scrollbars(context);
   }

   //-------------------------------------------------------------------------
   // If there is no data, then display that here
   //-------------------------------------------------------------------------
   else // this.col_count == 0
   {
      let centerPt = contentRect.get_center();
      context.font = this.headingFont;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = this.fontColorHeading;
      context.fillText("No Data", centerPt.x, centerPt.y);
   }


   context.strokeStyle = "#000000";
   context.strokeRect(1, 1, this.width - 1, this.tableHeight - 1); //Frame the border last

   context.restore();
};

/************************************************************************************
 * CsiTable: draw_column_lines
 *
 * Draw the lines around the columns first
 *
 * Input:
 *     context:  drawing graphics conext
 *    
 ************************************************************************************/
CsiTable.prototype.draw_column_lines = function(context)
{
   var cur_x = 0;
   context.strokeStyle = this.headingFontColor;

   var fixed_offset = 0;
   
   //Frame Timestamp
   if (this.showTimestamp)
   {
      context.strokeRect(cur_x, 0, this.col_widths[fixed_offset], this.tableHeight);
      cur_x += this.col_widths[fixed_offset];
      fixed_offset++;
   }

   if(this.left_col < fixed_offset)
   {
      this.left_col = fixed_offset;
   }

   for(let cur_col = this.left_col; cur_col < this.col_count && cur_x < this.width; cur_col++)
   {
      context.strokeRect(cur_x, 0, this.col_widths[cur_col], this.tableHeight);
      cur_x += this.col_widths[cur_col];
   }

};

/************************************************************************************
 * CsiTable: draw_row
 *
 * draw the row at the given location
 *
 * Input:
 *     context:  drawing graphics conext
 *     row:  array of strings, which is the data to display
 *     y_pos:  our current  y position to draw the text
 *    
 ************************************************************************************/
CsiTable.prototype.draw_row = function(context, row, y_pos, textDecorations)
{
   var cur_x = 0;

   //Draw Timestamp
   let fixed_offset = 0;
   if (this.showTimestamp) 
   {
      drawTextWithDecorations(context, row[fixed_offset], cur_x + this.col_widths[fixed_offset] / 2.0, y_pos + this.margin, null, textDecorations);
      cur_x += this.col_widths[fixed_offset];
      fixed_offset++;
   }

   if(this.left_col < fixed_offset)
   {
      this.left_col = fixed_offset;
   }

   for(let i = this.left_col; i < this.col_count && cur_x < this.width; i++)
   {
      drawTextWithDecorations(context, row[i], cur_x + this.col_widths[i] / 2.0, y_pos + this.margin, null, textDecorations);
      cur_x += this.col_widths[i];
   }

   context.strokeStyle = this.headingFontColor;
   context.strokeRect(0, y_pos - 2 * this.margin, this.width, this.row_height);
};


/************************************************************************************
 * CsiTable: draw_scrollbars
 *
 * draw the scroll bars, if necessary to the right and bottom of the table.
 *
 ************************************************************************************/
CsiTable.prototype.draw_scrollbars = function(context)
{
   if(this.needs_vscrollbar)
   {
      this.draw_vscrollbar(context);
   }

   if(this.needs_hscrollbar)
   {
      this.draw_hscrollbar(context);
   }

};


/************************************************************************************
 * CsiTable: draw_vscrollbar
 *
 * draw the scroll bars, if necessary to the right and bottom of the table.
 *
 ************************************************************************************/
CsiTable.prototype.draw_vscrollbar = function(context)
{
   let scrollBarRect = new Rect (this.width - SCROLL_BTN_SIZE, 
                                 this.row_height + 1,  //  do not draw scroll over header, 
                                 SCROLL_BTN_SIZE, 
                                 this.tableHeight - this.row_height);
   if(this.needs_hscrollbar)
   {
      scrollBarRect.height -= SCROLL_BTN_SIZE;
      scrollBarRect.updateBottom();
   }

   context.fillStyle = "#f0f0f0";
   context.fillRect(scrollBarRect.left, scrollBarRect.top, scrollBarRect.width, scrollBarRect.height);

   let minPos = scrollBarRect.top  + this.size_vscrollbar_pos / 2 + 1;
   let maxPos = scrollBarRect.bottom - this.size_vscrollbar_pos / 2 - 1;

   let pos = this.scrollYPosPercent * (maxPos - minPos) + minPos;

   scrollBarRect.left += 3;
   scrollBarRect.right -= 3;
   scrollBarRect.top  = pos - this.size_vscrollbar_pos / 2;
   scrollBarRect.bottom = pos + this.size_vscrollbar_pos / 2;

   context.fillStyle = "#c7c7c7";
   fillRoundedRect(context, scrollBarRect, 10);
};


/************************************************************************************
 * CsiTable: draw_hscrollbar
 *
 * draw the scroll bars, if necessary to the right and bottom of the table.
 *
 ************************************************************************************/
CsiTable.prototype.draw_hscrollbar = function(context)
{
   let scrollBarRect = new Rect (0 + 1, this.tableHeight - SCROLL_BTN_SIZE, this.width-2, SCROLL_BTN_SIZE);

   context.fillStyle = "#f0f0f0";
   context.fillRect(scrollBarRect.left, scrollBarRect.top, scrollBarRect.width, scrollBarRect.height);

   let avail_width = scrollBarRect.width;
   if(this.needs_vscrollbar)
   {
      avail_width -= SCROLL_BTN_SIZE;
   }

   let minPos = scrollBarRect.left  + this.size_hscrollbar_pos / 2 + 1;
   let maxPos = scrollBarRect.right - this.size_hscrollbar_pos / 2 - 1;
   if(this.needs_vscrollbar)
   {
      maxPos -= SCROLL_BTN_SIZE;
   }

   let pos = this.scrollXPosPercent * (scrollBarRect.right - scrollBarRect.left) + scrollBarRect.left;
   if (pos < minPos) {
      pos = minPos;
   }
   if (pos > maxPos) {
      pos = maxPos;
   }

   scrollBarRect.top += 3;
   scrollBarRect.bottom -= 3;
   scrollBarRect.left  = pos - this.size_hscrollbar_pos / 2;
   scrollBarRect.right = pos + this.size_hscrollbar_pos / 2;

   context.fillStyle = "#c7c7c7";
   fillRoundedRect(context, scrollBarRect, 10);
};


CsiTable.prototype.activate = function(context)
{
   CsiComponent.prototype.activate.call(this);
   csiMouseEvents.register_gesture(this.pan_gesture);
   csiMouseEvents.register_gesture(this.tap_gesture);
};


CsiTable.prototype.deactivate = function()
{
   CsiComponent.prototype.deactivate.call(this);
   csiMouseEvents.release_gesture(this.pan_gesture);
   csiMouseEvents.release_gesture(this.tap_gesture);
   csiMouseEvents.hideMenu();
};


CsiTable.prototype.on_single_tap_complete = function(gesture)
{
   var pos = gesture.get_origin();
   this.OnLButtonDown(pos.x, pos.y);
   this.OnLButtonUp(pos.x, pos.y);
};


CsiTable.prototype.on_swipe_moved = function(gesture, delta_x, delta_y)
{
   var pos = this.translate_canvas(gesture.last_touch);
   var handled = this.OnMouseDrag(pos.x, pos.y);
   if(!handled)
   {
      var deltapos = 2;
      var deltaneg = -2;
      //This is a pan in the middle of the table.
      if(delta_x > deltapos)
      {
         this.left_col -= 1;
      }
      else if(delta_x < deltaneg)
      {
         this.left_col += 1;
      }

      if(delta_y > deltapos)
      {
         this.top_row -= 1;
      }
      else if(delta_y < deltaneg)
      {
         this.top_row += 1;
      }

      if(this.left_col < 0)
      {
         this.left_col = 0;
      }
      else if(this.left_col >= this.totalScrollCols-1)
      {
         this.left_col = this.totalScrollCols-1;
      }

      if(this.top_row < 0)
      {
         this.top_row = 0;
      }
      else if(this.top_row >= this.rows.length)
      {
         this.top_row = this.rows.length - 1;
      }

      this.scrollXPosPercent = this.left_col / this.totalScrollCols;
      this.scrollYPosPercent = this.top_row / (this.rows.length-1);


      this.invalidate();
   }
};


//right mouse button click.  Show popup "Acknowledge Alarm" menu item
CsiTable.prototype.OnRButtonClick = function(mouseX, mouseY)
{
   var component = this;
   csiMouseEvents.hideMenu();

   $("<div id='context'></div>").html("<ul class='context_menu'><li id='export_data' class='menu_item'>Export Data</li><li id='clear_data' class='menu_item'>Remove All Data</li><li class='menu_item'>Cancel</li></ul>")
      .css({
         position: 'absolute',
         zIndex: '9999',
         left: mouseX + canvasOffsetX,
         top: mouseY + canvasOffsetY
      }).show().appendTo('body');

   $('ul.context_menu').css({
      listStyle: 'none',
      padding: '1px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: 'auto'
   });

   $('li.menu_item').mouseover(function()
   {
      $(this).css({
         backgroundColor: '#E9EFF8'
      });
   }).mouseout(function()
   {
      $(this).css({
         backgroundColor: 'transparent'
      });
   }).css({
      width: 'auto',
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
   }).click(function()
   {
      csiMouseEvents.hideMenu();
   });

   $('#export_data').click(function()
   {
      var col_count = 0;
      var i;
      for(i = 0; i < component.col_count; ++i)
      {
         col_count += component.col_char_counts[i] + 4; //pad each column
      }

      var row_count = component.rows.length;
      var generator = window.open('', '_blank', 'location=no,menubar=yes,titlebar=yes,toolbar=yes,resizable=yes,scrollbars=yes', true);

      var doc_contents = "";
      doc_contents += '<html><head><title>Data Export</title></head><body>';
      doc_contents += '<textArea cols=' + col_count + ' rows=' + row_count + ' title="Data Export" readOnly="true" wrap="off" >';
      //Write the header first
      var fh;
      for(fh = 0; fh < component.col_count; ++fh)
      {
         if(fh > 0)
         {
            doc_contents += ', ';
         }
         //Quote all the header labels
         doc_contents += '"' + component.fixed_table_header[fh] + '"';
      }
      generator.document.write(doc_contents);
      doc_contents = "";

      //Write out each row
      var r;
      for(r = 0; r < row_count; ++r)
      {
         var current_row = component.rows[r];
         var c;
         for(c = 0; c < component.col_count; ++c)
         {
            if(c === 0) //Is this a new line?
            {
               doc_contents += '\r\n';
            }
            else
            {
               doc_contents += ', ';
            }

            //Quote strings and dates if needed
            var needs_quote = (c === 0); //Timestamp always needs quoted
            if(!needs_quote)
            {
               var offset = 1; //Timestamp always shown
               if(this.showRecordNumber)
               {
                  offset = 2;
                  if(c === 1)
                  {
                     needs_quote = false;
                  }
               }

               if((c - offset) >= 0)
               {
                  var col_type = component.col_types[c - offset];
                  if(col_type === Enum.ColDataTypes.DATE || col_type === Enum.ColDataTypes.STRING)
                  {
                     needs_quote = true;
                  }
               }
            }

            if(needs_quote)
            {
               doc_contents += '"' + current_row[c] + '"';
            }
            else
            {
               doc_contents += current_row[c];
            }
         }
      }
      doc_contents += '</textArea></body></html>';

      generator.document.write(doc_contents);
      doc_contents = "";

      generator.document.close();
   });
   $('#clear_data').click(function()
   {
      component.rows = [];
      component.invalidate();
   });
};


CsiTable.prototype.OnLButtonDown = function(mouseX, mouseY)
{
   csiMouseEvents.hideMenu();
   this.buttonDown = true;
   this.scroll_btn = this.scroll_btn_hit_test(mouseX, mouseY);
   switch(this.scroll_btn)
   {
      case Enum.ScrollBarBtn.NONE:
         return false;
      default:
         return true;
   }
};


CsiTable.prototype.OnLButtonUp = function(mouseX, mouseY)
{
   if(this.buttonDown)
   {
      this.scroll_btn = this.scroll_btn_hit_test(mouseX, mouseY);
      switch(this.scroll_btn)
      {
         case Enum.ScrollBarBtn.HSCROLLER:
         case Enum.ScrollBarBtn.VSCROLLER:
            this.CalculateScrollPos(mouseX, mouseY);
            this.invalidate();
            break;

         //case Enum.ScrollBarBtn.NONE:          
         default:
            if(mobileBrowser)
            {
               this.OnRButtonClick(mouseX, mouseY);
            }
            break;
      }
   }
   this.buttonDown = false;
   this.scroll_btn = Enum.ScrollBarBtn.NONE;
};


CsiTable.prototype.OnMouseDrag = function(mouseX, mouseY)
{
   var rtn = false;
   switch(this.scroll_btn)
   {
      case Enum.ScrollBarBtn.HSCROLLER:
      case Enum.ScrollBarBtn.VSCROLLER:
         this.CalculateScrollPos(mouseX, mouseY);
         this.invalidate();
         rtn = true;
         break;
      //case Enum.ScrollBarBtn.NONE:      
      default:
         break;
   }
   return rtn; //Prevent default behavior
};

CsiTable.prototype.CalculateScrollPos = function(mouseX, mouseY)
{
   switch (this.scroll_btn)
   {
      case Enum.ScrollBarBtn.HSCROLLER:
         var scroll_x_click = mouseX - this.left;
         var avail_width = this.width;
         if(this.needs_vscrollbar)
         {
            avail_width -= SCROLL_BTN_SIZE;
         }
         var percent_x = scroll_x_click / avail_width;
         if (percent_x < 0) percent_x = 0;
         if (percent_x > 1) percent_x = 1;

         this.left_col = parseFloat((this.totalScrollCols * percent_x).toFixed(0));
         this.scrollXPosPercent = percent_x;
         break;
      case Enum.ScrollBarBtn.VSCROLLER:
         var scroll_y_click = mouseY - this.top - this.row_height;
         var avail_height = this.height - this.row_height;
         if(this.needs_hscrollbar)
         {
            avail_height -= SCROLL_BTN_SIZE;
         }
         var percent_y = scroll_y_click / avail_height;
         if (percent_y < 0) percent_y = 0;
         if (percent_y > 1) percent_y = 1;
         this.top_row = parseFloat((((this.rows.length) - this.max_visible_rows) * percent_y).toFixed(0));
         this.scrollYPosPercent = percent_y;
         break;
   }
};



CsiTable.prototype.OnMouseMove = function(mouseX, mouseY)
{
   var rtn = false;
   if(this.scroll_btn_hit_test(mouseX, mouseY) !== Enum.ScrollBarBtn.NONE)
   {
      document.body.style.cursor = "pointer";
      rtn = true; //Prevent default behavior
   }
   else
   {
      document.body.style.cursor = "default";
      rtn = false;
   }
   return rtn;
};


CsiTable.prototype.OnMouseExit = function()
{
   document.body.style.cursor = "default";
   this.buttonDown = false;
   this.scroll_btn = Enum.ScrollBarBtn.NONE;
   return true; //Prevent default behavior
};


CsiTable.prototype.scroll_btn_hit_test = function(mouseX, mouseY)
{
   var relX = mouseX - this.left;
   var relY = mouseY - this.top;
   //See if we can find where we are clicking
   var rtn = Enum.ScrollBarBtn.NONE;
   if(this.needs_hscrollbar && 
      relY > this.tableHeight - SCROLL_BTN_SIZE &&
      relY < this.tableHeight)
   {
      if(relX > 1 && relX < (this.width - (this.needs_vscrollbar ? SCROLL_BTN_SIZE : 0)))
      {
         rtn = Enum.ScrollBarBtn.HSCROLLER;
      }
   }
   else if(this.needs_vscrollbar && relX > this.width - SCROLL_BTN_SIZE)
   {
      if(relY > 0 && relY < (this.tableHeight - (this.needs_hscrollbar ? SCROLL_BTN_SIZE : 0)))
      {
         rtn = Enum.ScrollBarBtn.VSCROLLER;
      }
   }
   return rtn;
};


CsiTable.prototype.get_type = function(xsd_type)
{
   var rtn = Enum.ColDataTypes.OTHER;
   if(xsd_type === "xsd:dateTime")
   {
      rtn = Enum.ColDataTypes.DATE;
   }
   else if(xsd_type === "xsd:float" || xsd_type === "xsd:double")
   {
      rtn = Enum.ColDataTypes.FLOAT;
   }
   else if(xsd_type === "xsd:string")
   {
      rtn = Enum.ColDataTypes.STRING;
   }
   else if(xsd_type === "xsd:int")
   {
      rtn = Enum.ColDataTypes.INT;
   }
   else if(xsd_type === "xsd:boolean")
   {
      rtn = Enum.ColDataTypes.BOOL;
   }
   return rtn;
};


CsiTable.prototype.reset_data = function(reset_settings)
{
   this.bad_data = true;
   this.rows = [];
   if(reset_settings)
      this.maxRecords = Number.MAX_VALUE;
   this.top_row = 0;
   this.needs_vscrollbar = false;
   this.needs_hscrollbar = false;
};



/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/CsiPanel.js $

Copyright (C) 2010, 2019 Campbell Scientific, Inc.
*/


function CsiPanel(left, top, width, height)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   CsiComponent.call(this, left, top, width, height);
   this.bad_data = false;
}
CsiPanel.prototype = new CsiComponent();

// Nothing to be done.
CsiPanel.prototype.draw = function (context) { };

/* $HeadURL: svn://engsoft/rtmc-5.0/rtmc/javascript/RTMCScreen.js $

   Copyright (C) 2010, 2019 Campbell Scientific, Inc.

   Started On: 10/5/2010 7:48:58 AM
   Started By: Tyler Mecham
*/


function RTMCScreen()
{
   this.width = graphicsManager.canvas.width;
   this.height = graphicsManager.canvas.height;
   this.show_image = false;
   this.file_name = "";
   this.background_image = null;
   this.background_color = "white";
   this.drawStyle = Enum.DrawStyleType.stretch;
   this.ready = false;
   this.reportScreenIsAnimating = false;
}
RTMCScreen.prototype = [];


RTMCScreen.prototype.draw = function (context)
{
   context.fillStyle = this.background_color;
   context.fillRect(0, 0, this.width, this.height);
   if(this.file_name.length > 0)
   {
      if(this.background_image === null) 
      {
         this.ready = false;
         this.background_image = new Image();
         this.background_image.owner = this;
         this.background_image.onload = RTMCScreen.prototype.onload;
         this.background_image.onerror = RTMCScreen.prototype.onerror;
         this.background_image.onabort = RTMCScreen.prototype.onerror;
         this.background_image.src = this.file_name;
      }
      else if(this.ready)
      {
         if(this.drawStyle === Enum.DrawStyleType.stretch)
         {
            context.drawImage(this.background_image, 0, 0, this.width, this.height);
         }
         else if(this.drawStyle === Enum.DrawStyleType.tile)
         {
            var currLeft = 0;
            while(currLeft <= this.width)
            {
               var currTop = 0;
               while(currTop <= this.height)
               {
                  context.drawImage(this.background_image, currLeft, currTop);
                  currTop += this.background_image.height;
               }
               currLeft += this.background_image.width;
            }
         }
         else if(this.drawStyle === Enum.DrawStyleType.center)
         {
            context.drawImage(this.background_image, (this.width - this.background_image.width) / 2.0,
               (this.height - this.background_image.height) / 2.0);
         }
         else //Enum.DrawStyleType.best_fit
         {
            var im_w = this.background_image.width;
            var im_h = this.background_image.height;
            var comp_w = this.width;
            var comp_h = this.height;
            var image_aspect_ratio = 0;
            //Scale the image
            if(im_w < im_h)
            {
               image_aspect_ratio = im_w / im_h;
               im_h = comp_h;
               im_w = im_h * image_aspect_ratio;

               if(im_w > comp_w) //Keep the image inside the comp bounds
               {
                  im_w = comp_w;
                  im_h = im_w / image_aspect_ratio;
               }
            }
            else
            {
               image_aspect_ratio = im_h / im_w;
               im_w = comp_w;
               im_h = im_w * image_aspect_ratio;

               if(im_h > comp_h) //Keep the image inside the comp bounds
               {
                  im_h = comp_h;
                  im_w = im_h / image_aspect_ratio;
               }
            }
            var im_x = (this.width/2) - (im_w/2);
            var im_y = (this.height/2) - (im_h/2);
            context.drawImage(this.background_image, im_x, im_y, im_w, im_h);
         }
      }
      //else
      //{
      //   No image loaded, so don't draw anything
      //}
   }
};


RTMCScreen.prototype.onload = function()
{
   this.owner.ready = true;
   graphicsManager.invalidate();
};


RTMCScreen.prototype.onerror = function()
{
   this.owner.ready = false;
   this.owner.background_image = null;
};


Enum.DrawStyleType =
{
   stretch:0,
   tile:1,
   center:2,
   best_fit: 3
};
/* CsiGraphicsManager.js

   Copyright (C) 2010, 2019 Campbell Scientific, Inc.

   Written by: Kevin Westwood
   Date Begun: 5 October 2010

*/

var graphicsManager = null; //GLOBAL DECLARATION
var mobileBrowser = false; //GLOBAL DECLARATION
var canvasOffsetX = 0; //GLOBAL DECLARATION
var canvasOffsetY = 0; //GLOBAL DECLARATION


//CsiGraphicsManager manages painting of controls
function CsiGraphicsManager(canvas, context)
{
   //Do not add properties to prototype
   if(arguments.length === 0)
   {
      return;
   }

   //Check the user agent to see if we are a mobile browser or not
   var ua = navigator.userAgent;
   var checker = 
   {
      iphone: ua.match(/(iPhone|iPod|iPad)/),
      blackberry: ua.match(/BlackBerry/),
      android: ua.match(/Android/),
      palm: ua.match(/Palm/),
      nokia: ua.match(/Nokia/),
      mini: ua.match(/Mini/),
      mobile: ua.match(/Mobi/)
      };
   if(checker.iphone || checker.blackberry || checker.android || checker.palm || checker.nokia || checker.mini || checker.mobile)
   {
      mobileBrowser = true; //Set the global boolean for mobileBrowser 
   }

   this.canvas = canvas;
   this.context = context;
   this.tabs = [];
   this.active_comps = null;
   this.animation_disabled = false;
   this.setFramesPerSecond(15);
   this.animationIntervalID = -1;
   this.count = 0; //count down timer
   this.color_r = 0;
   this.color_g = 0;
   this.color_b = 0;
   this.auto_tab_interval = 0;
   this.cur_tab_index = 0;
   this.data_manager_started = false;
   this.other_tab_showing = false; //Track if an active canvas screen is being shown or an iFrame screen
   this.auto_tabbing = false;
   this.total_tab_count = 0; //total tabs including data, status, etc
}


CsiGraphicsManager.prototype.setFramesPerSecond = function (fps)
{
   this.framesPerSecond = fps;
   this.refreshRate = (1 / this.framesPerSecond) * 1000; //convert to ms refresh rate
};


CsiGraphicsManager.prototype.addTab = function (components)
{
   //Activate the first set of comps we get
   if(this.tabs.length <= 0)
   {
      this.active_comps = components;
   }

   components.all_ready = false;
   this.tabs.push(components);

   var len = components.length;
   var i;
   for(i = 0; i < len; i++)
   {
      components[i].graphicsManager = this;
   }
};


CsiGraphicsManager.prototype.setTotalTabCount = function (total_count)
{
   this.total_tab_count = total_count;
};

jQuery.fn.reverse = [].reverse;

CsiGraphicsManager.prototype.activateTab = function (tab_index, stop_tabbing, from_menu)
{
   //Get rid of tooltip if it was showing and we switched tabs
   $("#tooltip_div").hide();
   $("#tooltip_div").remove();

   canvasOffsetX = $('#rtmc_canvas').offset().left;
   canvasOffsetY = $('#rtmc_canvas').offset().top;

   var total_tab_count = this.total_tab_count;
   this.other_tab_showing = false;
   var comp_count = 0;
   var canvas_tab_count = this.tabs.length;
   var tabs_div = $("#tabs");
   var tabs_list = tabs_div.find('.nav-tabs');
   var tab_item = null;
   var tab_visible = false;

   //Make sure the requested tab_index is inbounds
   if(!tab_index || tab_index >= this.total_tab_count || tab_index < 0)
   {
      tab_index = 0;
   }
   this.cur_tab_index = tab_index;

   //Iterate through all the tabs and find the one with the right tab_index
   tabs_list.find('li').each(function(j, li)
   {
      if(j === tab_index)
      {
         //Found the tab
         tab_item = $(li);
         tab_item.addClass('active').addClass('show');

         //Check to see if the tab is actually visible on the screen
         if(graphicsManager.is_tab_visible(tabs_list, tab_item))
         {
            tab_visible = true;
         }
      }
      else
      {
         //If we aren't the active tab, then we need to remove active and show classes
         $(li).removeClass('active').removeClass('show');
      }
   });

   //If we found a valid tab and it isn't visible, we need to scroll it into view
   if(tab_item && !tab_visible)
   {
      var scroll_pos = tabs_list.scrollLeft() + tab_item.position().left - tabs_list.outerWidth()/2.0;
      tabs_list.animate({ 'scrollLeft': scroll_pos + "px" });
   }

   //Check to see if this is an internal screen tab or an external iframe tab
   if(tab_index >= canvas_tab_count)
   {
      this.other_tab_showing = true;
   }

   //Deactivate the active components since we are switching screens
   var i;
   if(this.active_comps)
   {
      comp_count = this.active_comps.length;
      for(i = 0; i < comp_count; i++)
      {
         this.active_comps[i].deactivate();
      }
   }

   //Is this a canvas screen?
   if(!this.other_tab_showing)
   {
      //We are showing a canvas tab, so hide all iframes
      tabs_div.find('iframe').each(function(j, iframe)
      {
         $(iframe).addClass('d-none');
      });

      //Show canvas
      $('#canvas_container').removeClass('d-none');

      //Set the active comps from the new screen and then activate them all
      this.active_comps = this.tabs[tab_index];
      comp_count = this.active_comps.length;
      for(i = 0; i < comp_count; i++)
      {
         this.active_comps[i].activate(this.context);
      }

      this.draw(false);
   }
   else
   {
      //We aren't a canvas screen, so we have no active comps
      this.active_comps = null;

      //Hide canvas
      $('#canvas_container').addClass('d-none');

      //Find the iframe we need to show
      tabs_div.find('iframe').each(function(j, iframe)
      {
         let $iframe = $(iframe);
         let iframe_tab_index = parseInt($iframe.attr('tabIndex'));
         if(iframe_tab_index === tab_index)
         {
            $iframe.removeClass('d-none');
         }
         else
         {
            $iframe.addClass('d-none');
         }
      });
   }

   //If the user interacted with the screen, we need to disable auto tabbing
   if(stop_tabbing)
   {
      this.stopAutoTabbing();
   }

   $("html, body").animate({ scrollTop: 0 }, "slow");
};


CsiGraphicsManager.prototype.is_tab_visible = function (tabs_list, tab)
{
   var tab_pos = tab.position().left;
   var tab_width = tab.width();
   var nav_width = tabs_list.width();

   return (tab_pos > 0 && ((tab_pos + tab_width) < nav_width));
};


//Called initially In RTMC project when the main window is ready.
CsiGraphicsManager.prototype.start = function ()
{
   this.invalidate();
   if(this.auto_tab_interval > 0)
   {
      this.startAutoTabbing();
      $("#resume_auto_tab").click(function () { graphicsManager.startAutoTabbing(); });
   }
};


CsiGraphicsManager.prototype.startAutoTabbing = function ()
{
   if(this.auto_tab_interval > 0)
   {
      oneShotTimer.setTimeout(this, "AutoTab", this.auto_tab_interval);
      $("#resume_auto_tab").hide();
   }
};


CsiGraphicsManager.prototype.stopAutoTabbing = function ()
{
   if(this.auto_tab_interval > 0)
   {
      oneShotTimer.clearTimeout(this, "AutoTab");
      $("#resume_auto_tab").fadeIn(1000);
   }
};


CsiGraphicsManager.prototype.onOneShotTimer = function (tag)
{
   if(tag === "AutoTab")
   {
      if(this.isActiveTabReady() || this.cur_tab_index >= this.tabs.length)
      {
         this.auto_tabbing = true;
         this.activateTab(this.cur_tab_index + 1, false, true);
         this.auto_tabbing = false;
      }
      oneShotTimer.setTimeout(this, "AutoTab", this.auto_tab_interval);
   }
   else if(tag === "AlarmCheck")
   {
      var check_alarms_again = false;


      if(check_alarms_again)
      {
         oneShotTimer.setTimeout(this, "AlarmCheck", 10000); //Check for alarm tab updates
      }
   }
};


CsiGraphicsManager.prototype.update_alarm_tabs = function ()
{
   this.tabs.forEach(function(cur_tab, index) {
      var tab_has_alarm = false;
      cur_tab.forEach(function(component) {
         if(typeof component.hasActiveAlarm === "function" && component.hasActiveAlarm())
            tab_has_alarm = true;
      });
      if(tab_has_alarm)
         $("#tabs-" + index).show();
      else
         $("#tabs-" + index).hide();
   });
   canvasOffsetX = $('#rtmc_canvas').offset().left;
   canvasOffsetY = $('#rtmc_canvas').offset().top;
};


function forceDraw()
{
   graphicsManager.draw(true);
}


CsiGraphicsManager.prototype.invalidate = function ()
{
   if(this.animationIntervalID < 0)
   {
      this.animationIntervalID = setInterval(forceDraw, this.refreshRate);
   }
};


//When a component calls invalidate, this method is called
CsiGraphicsManager.prototype.componentInvalidate = function (component)
{
   if(component.active)
   {
      this.invalidate();
   }
};


//When component.refresh() is called, redraw the entire screen
CsiGraphicsManager.prototype.componentRefresh = function (component)
{
   if(component.active)
   {
      this.draw(false);
   }
};


//Draw all components (if they are all ready).  This method is called via a
//setInterval() timer.  The timer stops when all components have stopped animating.
//updateAnimation should only be passed as true if called by the animation timer
CsiGraphicsManager.prototype.draw = function (updateAnimation)
{
   var i = 0;
   if(this.other_tab_showing) //Don't draw since an iFrame screen is active
   { return; }

   if(this.active_comps === null)
   {
      this.context.fillStyle = 'white';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
   }
   else
   {
      this.active_comps.draw(this.context);
   }

   if(this.active_comps && this.isActiveTabReady())
   {
      var animating = false;

      var bad_data_comps = [];
      var nan_data_comps = [];
      var len = this.active_comps.length;
      for(i = 0; i < len; i++)
      {
         this.context.save();
         var component = this.active_comps[i];

         try
         {
            if(component.getAnimating())
            {
               if(updateAnimation)
               {
                  component.updateAnimation();
               }

               if(component.getAnimating())
               {
                  animating = true; //still needs animation
               }
            }

            if((!component.valid) || (!component.drawOnlyIfInvalid))
            {
               this.context.save();

               var rect = new Rect(component.left, component.top, component.width, component.height);

               // Translate to component center, rotate, then translate back
               this.context.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);
               this.context.rotate(degreesToRadians(component.RotationAngle || 0));
               this.context.translate(-rect.left - rect.width / 2, -rect.top - rect.height / 2);

               var oldRect = new Rect(rect);

               // Draw background only if the component has a background
               if (component.bHasBackground)
                  rect = component.drawBackground(this.context, rect);

               // Clip to component drawing area
               if (component.bUseClip)
                  clipRect(this.context, rect.left, rect.top, rect.width, rect.height);

               // Copy new rectangle attributes
               component.left = rect.left;
               component.right = rect.right;
               component.top = rect.top;
               component.bottom = rect.bottom;
               component.width = rect.width;
               component.height = rect.height;

               component.draw(this.context);

               this.context.restore();

               // Copy old rectangle attributes
               component.left = oldRect.left;
               component.right = oldRect.right;
               component.top = oldRect.top;
               component.bottom = oldRect.bottom;
               component.width = oldRect.width;
               component.height = oldRect.height;

               component.valid = true;
            }

            if(component.getBadData())
            {
               bad_data_comps.push(component);
            }
            else if(component.getNanData())
            {
               nan_data_comps.push(component);
            }
         }
         catch(err)
         {
            csi_log(err + "\nError drawing component at " + component.left + ", " + component.top);
         }

         this.context.restore();
      }

      //Draw the bad data symbol if there are any
      len = bad_data_comps.length;
      for(i = 0; i < len; i++)
      {
         drawBadData(bad_data_comps[i], this.context);
      }

      //Draw the bad data symbol if there are any
      len = nan_data_comps.length;
      for(i = 0; i < len; i++)
      {
         drawNanData(nan_data_comps[i], this.context);
      }

      //if animating and the animation timer is not going, start it
      if(animating)
      {
         this.invalidate();
      }
      else
      {
         //if no longer animating, stop the animation timer
         clearInterval(this.animationIntervalID);
         this.animationIntervalID = -1;
      }
   }
   else
   {
      //Draw the loading graphic
      i = 0;
      var size, x, y, ang, rads;
      var density = 30;
      var animBits = Math.round(density * 1.0);
      var bitMod, minBitMod = 0;
      var arc = 0;
      var di = 200;
      var e = 0.47;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.save();
      this.context.translate(this.canvas.width / 2.0, this.canvas.height / 2.0);
      this.count %= 360;
      if(this.count === 0)
      {
         this.color_r = Math.floor(Math.random() * 156);
         this.color_g = Math.floor(Math.random() * 156);
         this.color_b = Math.floor(Math.random() * 156);
      }
      this.count += 10;

      this.context.rotate(degreesToRadians(this.count));
      while(i < density)
      {
         bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
         ang = 270 - 360 / density * i;
         rads = degreesToRadians(ang);
         this.context.fillStyle = "rgba(" + this.color_r + ", " + this.color_g + ", " + this.color_b + ", " + bitMod.toString() + ")";
         size = di * 0.07;
         x = di * e + Math.cos(rads) * (di * e - size) - di * e;
         y = di * e + Math.sin(rads) * (di * e - size) - di * e;
         this.context.beginPath();
         this.context.arc(x, y, size * bitMod, 0, Math.PI * 2, false);
         this.context.closePath();
         this.context.fill();
         ++i;
      }
      this.context.restore();

      this.context.save();
      this.context.translate(this.canvas.width / 2.0, this.canvas.height / 2.0);
      this.context.font = "20pt Arial";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillStyle = "rgba(" + this.color_r + ", " + this.color_g + ", " + this.color_b + ", 1.0)";
      this.context.fillText("Loading", 0, 0);
      this.context.restore();
   }
};


//Are all active components ready to be painted.  Some components, such as images
//cannot be accessed until their resources are completely loaded
CsiGraphicsManager.prototype.isActiveTabReady = function ()
{
   var rtn = true;
   if(this.active_comps === null)
   {
      rtn = false;
   }
   else
   {
      if(!this.active_comps.all_ready)
      {
         var j;
         var comp_count = this.active_comps.length;
         for(j = 0; j < comp_count && rtn; j++)
         {
            if(!this.active_comps[j].ready)
            {
               rtn = false;
            }
         }

         if(rtn)
         {
            this.active_comps.all_ready = true;

            //We should be ok to start the data manager now
            if(!this.data_manager_started)
            {
               this.data_manager_started = true;
               dataManager.start();
               if(theAlarmsManager)
               {
                  theAlarmsManager.start();
               }
            }
         }
      }
   }
   return rtn;
};


//Find the tab containing find_comp and see if it is all ready
CsiGraphicsManager.prototype.isParentTabReady = function (find_comp)
{
   var rtn = false;
   var found_tab = false;
   var tab_count = this.tabs.length;
   var cur_comp = null;
   var t = 0;
   var c = 0;
   for(t = 0; t < tab_count && !found_tab; t++)
   {
      var cur_tab = this.tabs[t];
      var comp_count = cur_tab.length;
      for(c = 0; c < comp_count && !rtn; c++)
      {
         cur_comp = cur_tab[c];
         if(cur_comp === find_comp)
         {
            found_tab = true;
            if(cur_tab.all_ready)
            {
               rtn = true;
            }
            break;
         }
      }

      if(found_tab && !rtn) //If the tab was found but wasn't considered ready, recheck all for ready
      {
         var all_ready = true;
         for(c = 0; c < comp_count && !rtn; c++)
         {
            cur_comp = cur_tab[c];
            if(!cur_comp.ready)
            {
               all_ready = false;
               break;
            }
         }
         cur_tab.all_ready = all_ready;
         if(cur_tab.all_ready) //The tab is now ready, so return true
         {
            rtn = true;
         }
      }
   }
   return rtn;
};


CsiGraphicsManager.prototype.hit_test_by_need = function (mouseX, mouseY)
{
   var rtn = null;
   if(this.active_comps) 
   {
      const len = this.active_comps.length;
      for(let i = len - 1; i >= 0; i--)
      {
         //Only look for components that might need the mouse
         var comp = this.active_comps[i];
         if(comp.needs_mouse_events)
         {
            //Check to see if we are in the comp bounds
            if(mouseX > comp.left && mouseX < comp.right &&
               mouseY > comp.top && mouseY < comp.bottom)
            {
               rtn = comp;
               break;
            }
         }
      }
   }
   return rtn;
};


CsiGraphicsManager.prototype.hit_test_hover = function (mouseX, mouseY)
{
   var rtn = null;
   if (this.active_comps) {
      const len = this.active_comps.length;
      for (let i = len - 1; i >= 0; i--) {
         //Only look for components that might need the mouse
         var comp = this.active_comps[i];
         if (comp.IncludeHoverCaption) {
            //Check to see if we are in the comp bounds
            if (mouseX > comp.left && mouseX < comp.right &&
               mouseY > comp.top && mouseY < comp.bottom) {
               rtn = comp;
               break;
            }
         }
      }
      return rtn;
   }
};



CsiGraphicsManager.prototype.OnMenuHidden = function ()
{
   if(this.active_comps) 
   {
      var len = this.active_comps.length;
      var i;
      for(i = 0; i < len; i++)
      {
         var comp = this.active_comps[i];
         if(typeof comp.OnMenuHidden === "function")
         {
            comp.OnMenuHidden();
         }
      }
   }
};


/**
 * @param {CsiComponent} component The component to check if needs data
 * @return {boolean} Returns true if a data request for the specified component should
 * be started.  This will be true if the component is on the current tab or
 * if none of the components on the current tab have bad data flags set.
 */
CsiGraphicsManager.prototype.component_needs_data = function(component)
{
   var rtn = component.active || component.isAlarm;
   if(!rtn)
   {
      if(this.active_comps)
      {
         rtn = !this.active_comps.some(function(active_comp)
         {
            return active_comp.bad_data;
         });
      }
      else
      {
         rtn = true;
      }
   }
   return rtn;
};




function start()
{
   var canvas = $('#rtmc_canvas')[0];
   var context = null;
   if(canvas)
   {
      if(canvas.getContext)
      {
         context = canvas.getContext('2d');
         if(typeof init_mouse === 'function')
            init_mouse();
      }
   }

   if(context)
   {
      var variables = [
        new CsiVariable("AlarmSelect", false),
        new CsiVariable("AlarmTrigger", false),
        new CsiVariable("Collection State", false),
        new CsiVariable("ActiveAlarm", false),
        null,
        new CsiVariable("AlarmLog", true),
        new CsiVariable("ActiveAlarm_Display", false)
      ];

      var expressions = [
        new CsiExpression([
          variables[0]
        ]),
        new CsiExpression([
          variables[1]
        ]),
        new CsiExpression([
          variables[2],
          new CsiConstant(1),
          new CsiGreater()
        ]),
        new CsiExpression([
          variables[3]
        ]),
        new CsiExpression([
          variables[4]
        ]),
        new CsiExpression([
          variables[5]
        ])
      ];

      var web_queries = [
        new CsiWebQuery("Server:CR300Series.Public.ActiveAlarm", "most-recent", "1", "", "", 1000, -1, [variables[3] ], "Gilgit ",0),
        new CsiWebQuery("Server:CR300Series.Public", "since-time", "2026-04-08T00:00:00.000000001", "", "collected", 1000, -1, [variables[0], variables[1] ], "Gilgit ",0),
        new CsiWebQuery("Server:__statistics__.CR300Series_std", "since-time", "2026-04-08T00:00:00.000000001", "", "collected", 1000, -1, [variables[2] ], "Gilgit ",0),
        new CsiWebQuery("Server:CR300Series.AlarmLog", "since-time", "2026-04-08T00:00:00.000000001", "", "collected", 1000, -1, [variables[5] ], "Gilgit ",0)
      ];

      theAlarmsManager = new CsiAlarmsManager(10000);
      dataManager = new CsiDataManager(web_queries, true);

      graphicsManager = new CsiGraphicsManager(canvas, context);

      var tab_0 = new RTMCScreen();
      tab_0.background_color = "RGBA(192, 192, 192, 1)";
      var panel_1 = new CsiPanel(118, 152, 1075, 628);
      panel_1.bHasBackground = true;
      panel_1.bUseClip = true;
      panel_1.backgroundMargin = 0;
      panel_1.eBackgroundBorderStyle = 3;
      panel_1.backgroundBorderColor = "RGBA(0, 0, 0, 1)";
      panel_1.backgroundBorderThickness = 1;
      panel_1.eBackgroundColorStyle = 0;
      panel_1.backgroundSolidColor = "RGBA(255, 255, 255, 1)";
      panel_1.eBackgroundGradientDirection = 2;
      panel_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      panel_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      panel_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      panel_1.backgroundGradientUseMid = true;
      panel_1.bBackgroundRoundedCorners = true;
      panel_1.backgroundRoundedRadius = 8;
      panel_1.RotationAngle = 0;
      panel_1.IncludeHoverCaption = false;
      panel_1.HoverCaption = "";
      tab_0.push(panel_1);

      var panel_2 = new CsiPanel(118, 19, 1075, 125);
      panel_2.bHasBackground = true;
      panel_2.bUseClip = true;
      panel_2.backgroundMargin = 0;
      panel_2.eBackgroundBorderStyle = 3;
      panel_2.backgroundBorderColor = "RGBA(0, 0, 0, 1)";
      panel_2.backgroundBorderThickness = 1;
      panel_2.eBackgroundColorStyle = 0;
      panel_2.backgroundSolidColor = "RGBA(255, 255, 255, 1)";
      panel_2.eBackgroundGradientDirection = 2;
      panel_2.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      panel_2.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      panel_2.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      panel_2.backgroundGradientUseMid = true;
      panel_2.bBackgroundRoundedCorners = true;
      panel_2.backgroundRoundedRadius = 8;
      panel_2.RotationAngle = 0;
      panel_2.IncludeHoverCaption = false;
      panel_2.HoverCaption = "";
      tab_0.push(panel_2);

      var label_1 = new CsiLabel(131, 27, 1050, 109, "Alarm Trigger System");
      label_1.bHasBackground = true;
      label_1.bUseClip = true;
      label_1.backgroundMargin = 0;
      label_1.eBackgroundBorderStyle = 3;
      label_1.backgroundBorderColor = "RGBA(0, 0, 0, 1)";
      label_1.backgroundBorderThickness = 1;
      label_1.eBackgroundColorStyle = 0;
      label_1.backgroundSolidColor = "RGBA(0, 0, 128, 1)";
      label_1.eBackgroundGradientDirection = 2;
      label_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      label_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      label_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      label_1.backgroundGradientUseMid = true;
      label_1.bBackgroundRoundedCorners = true;
      label_1.backgroundRoundedRadius = 8;
      label_1.RotationAngle = 0;
      label_1.IncludeHoverCaption = false;
      label_1.HoverCaption = "";
      label_1.font = "bold 26pt Arial Black";
      label_1.fontDecoration = 0;
      label_1.font_color = "RGBA(255, 255, 255, 1)";
      label_1.displayVertically = false;
      label_1.textAlign = 1;
      label_1.word_wrap = true;
      label_1.border_style = 3;
      tab_0.push(label_1);

      var table_1 = new CsiTable(156, 372, 1000, 390, expressions[5]);
      table_1.bHasBackground = true;
      table_1.bUseClip = true;
      table_1.backgroundMargin = 0;
      table_1.eBackgroundBorderStyle = 0;
      table_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      table_1.backgroundBorderThickness = 0;
      table_1.eBackgroundColorStyle = 1;
      table_1.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      table_1.eBackgroundGradientDirection = 2;
      table_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      table_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      table_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      table_1.backgroundGradientUseMid = true;
      table_1.bBackgroundRoundedCorners = true;
      table_1.backgroundRoundedRadius = 8;
      table_1.RotationAngle = 0;
      table_1.IncludeHoverCaption = false;
      table_1.HoverCaption = "";
      table_1.bHasBackground = false;
      table_1.bUseClip = true;
      table_1.maxRecords = 500;
      table_1.newDataAtTop = true;
      table_1.defaultPrecision = 1;
      table_1.showTimestamp = true;
      table_1.showRecordNumber = true;
      table_1.timestampFormat = "%Y-%m-%d %H:%M:%S";
      table_1.headingFontColor = "RGBA(0, 0, 0, 1)";
      table_1.contentFontColor = "RGBA(0, 0, 139, 1)";
      table_1.headerBackground = 
            {
                  eBackgroundColorStyle        : 0,
                  backgroundSolidColor         : "RGBA(166, 202, 240, 1.000000)",

                  eBackgroundGradientDirection : 2,
                  backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
                  backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
                  backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
                  backgroundGradientUseMid     : 1,
            }
      table_1.contextBackground = 
            {
                  eBackgroundColorStyle        : 1,
                  backgroundSolidColor         : "RGBA(255, 255, 255, 1.000000)",

                  eBackgroundGradientDirection : 2,
                  backgroundGradientStartColor : "RGBA(166, 202, 240, 1.000000)",
                  backgroundGradientMidColor   : "RGBA(255, 255, 255, 1.000000)",
                  backgroundGradientEndColor   : "RGBA(166, 202, 240, 1.000000)",
                  backgroundGradientUseMid     : 1,
            }
      table_1.headingFont = "bold 17pt Arial";
      table_1.headingFontDecoration = 0;
      table_1.contentFont = "14pt Arial";
      table_1.contentFontDecoration = 0;
      table_1.tableFilter = ['AlarmType', 'WaterLevel', 'PTemp', 'BattVolts'];
      table_1.showAllColumns = false;
      tab_0.push(table_1);

      var time_1 = new CsiTimeLabel(156, 176, 222, 33, Enum.TIME_SOURCE.Station_Time, null, 'Source:Station');
      time_1.sync_interval_ms = 900000;
      time_1.bHasBackground = true;
      time_1.bUseClip = true;
      time_1.backgroundMargin = 0;
      time_1.eBackgroundBorderStyle = 0;
      time_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      time_1.backgroundBorderThickness = 0;
      time_1.eBackgroundColorStyle = 0;
      time_1.backgroundSolidColor = "RGBA(0, 128, 128, 1)";
      time_1.eBackgroundGradientDirection = 2;
      time_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      time_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      time_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      time_1.backgroundGradientUseMid = true;
      time_1.bBackgroundRoundedCorners = true;
      time_1.backgroundRoundedRadius = 8;
      time_1.RotationAngle = 0;
      time_1.IncludeHoverCaption = false;
      time_1.HoverCaption = "";
      time_1.font = "bold 14pt Arial Narrow";
      time_1.fontDecoration = 0;
      time_1.font_color = "RGBA(255, 255, 255, 1)";
      time_1.displayVertically = false;
      time_1.textAlign = 1;
      time_1.format_string = "%Y-%m-%d %H:%M:%S";
      time_1.timeOffset = 0;
      tab_0.push(time_1);

      var report_range_1 = new CsiReportRange(460, 236, 527, 112, '2026-04-08 00:00:00', '2026-04-09 00:00:00', tab_0);
      report_range_1.header_font = "bold 17pt Cambria";
      report_range_1.header_fontDecoration = 0;
      report_range_1.header_live_font = "bold 17pt Arial";
      report_range_1.header_live_fontDecoration = 0;
      report_range_1.header_fontDecoration = 0;
      report_range_1.header_live_fontDecoration = 0;
      report_range_1.header_font_color = "RGBA(255, 255, 255, 1)";
      report_range_1.header_live_color = "RGBA(255, 255, 255, 1)";
      report_range_1.time_format_string = "%d/%m/%y %#H:%M";
      report_range_1.time_live_format_string = "%c";
      report_range_1.header_text = "Report Range: %DATE-RANGE%";
      report_range_1.header_live_text = "(Live Data)";
      report_range_1.word_wrap = false;
      report_range_1.textAlign = 1;
      report_range_1.bHasBackground = true;
      report_range_1.bUseClip = true;
      report_range_1.backgroundMargin = 0;
      report_range_1.eBackgroundBorderStyle = 3;
      report_range_1.backgroundBorderColor = "RGBA(0, 32, 96, 1)";
      report_range_1.backgroundBorderThickness = 2;
      report_range_1.eBackgroundColorStyle = 0;
      report_range_1.backgroundSolidColor = "RGBA(0, 32, 96, 1)";
      report_range_1.eBackgroundGradientDirection = 2;
      report_range_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      report_range_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      report_range_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      report_range_1.backgroundGradientUseMid = true;
      report_range_1.bBackgroundRoundedCorners = true;
      report_range_1.backgroundRoundedRadius = 8;
      report_range_1.RotationAngle = 0;
      report_range_1.IncludeHoverCaption = false;
      report_range_1.HoverCaption = "";
      report_range_1.js_name = "Gilgit ";
      report_range_1.interval_value = 1;
      report_range_1.hide_in_runtime = false;
      report_range_1.needs_mouse_events = true;
      report_range_1.bShowCurrentTime = true;
      report_range_1.bShowChooseDate = true;
      report_range_1.bShowNavigationButtons = true;
      report_range_1.bShowPlayButton = true;
      report_range_1.bShowRuntimeStepButton = false;
      report_range_1.animationRate = 1;
      report_range_1.calendarText = "Select Range";
      report_range_1.stepSizeText = "Step Size";
      report_range_1.arrowBackColor = "RGBA(240, 240, 240, 1)";
      report_range_1.arrowColor = "RGBA(0, 32, 96, 1)";
      report_range_1.liveTextFont = "bold 17pt Arial";
      report_range_1.liveTextFontDecoration = 0;
      report_range_1.calendarFont = "bold 17pt Arial";
      report_range_1.calendarFontDecoration = 0;
      report_range_1.hide_nav_buttons = false;
      report_range_1.calendar_btn_setting = 2;
      report_range_1.report_type = 0;
      report_range_1.interval_units = 2;
      report_range_1.duration_seconds = 0;
      report_range_1.duration_minutes = 0;
      report_range_1.duration_hod = 0;
      report_range_1.duration_dom = 0;
      report_range_1.duration_dow = 0;
      report_range_1.duration_month = 0;
      report_range_1.tooltipCalendar = "Select Range";
      report_range_1.tooltipBack = "Step Backward";
      report_range_1.tooltipPlay = "Play / Pause Animation";
      report_range_1.tooltipForward = "Step Forward";
      report_range_1.tooltipStepSize = "Set the Step Size for the Navigation Buttons";
      report_range_1.tooltipLive = "Turn off Report Range and Look at Live Data";
      tab_0.push(report_range_1);

      var hotspot_1 = new CsiHotSpot(417, 173, 105, 33);
      hotspot_1.bHasBackground = true;
      hotspot_1.bUseClip = true;
      hotspot_1.backgroundMargin = 0;
      hotspot_1.eBackgroundBorderStyle = 0;
      hotspot_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      hotspot_1.backgroundBorderThickness = 0;
      hotspot_1.eBackgroundColorStyle = 2;
      hotspot_1.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      hotspot_1.eBackgroundGradientDirection = 2;
      hotspot_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      hotspot_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      hotspot_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      hotspot_1.backgroundGradientUseMid = true;
      hotspot_1.bBackgroundRoundedCorners = true;
      hotspot_1.backgroundRoundedRadius = 8;
      hotspot_1.RotationAngle = 0;
      hotspot_1.IncludeHoverCaption = true;
      hotspot_1.HoverCaption = "Click to Open";
      hotspot_1.url = "";
      hotspot_1.useUrl = false;
      hotspot_1.urlTarget = "_self";
      hotspot_1.buttonText = "Station 1";
      hotspot_1.buttonFont = "bold 17pt Arial";
      hotspot_1.buttonFontDecoration = 1;
      hotspot_1.buttonTextColor = "RGBA(0, 0, 255, 1)";
      hotspot_1.needs_mouse_events = true;
      hotspot_1.screenIndex = 0;
      tab_0.push(hotspot_1);

      var hotspot_2 = new CsiHotSpot(541, 174, 105, 33);
      hotspot_2.bHasBackground = true;
      hotspot_2.bUseClip = true;
      hotspot_2.backgroundMargin = 0;
      hotspot_2.eBackgroundBorderStyle = 0;
      hotspot_2.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      hotspot_2.backgroundBorderThickness = 0;
      hotspot_2.eBackgroundColorStyle = 2;
      hotspot_2.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      hotspot_2.eBackgroundGradientDirection = 2;
      hotspot_2.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      hotspot_2.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      hotspot_2.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      hotspot_2.backgroundGradientUseMid = true;
      hotspot_2.bBackgroundRoundedCorners = true;
      hotspot_2.backgroundRoundedRadius = 8;
      hotspot_2.RotationAngle = 0;
      hotspot_2.IncludeHoverCaption = true;
      hotspot_2.HoverCaption = "Click to Open";
      hotspot_2.url = "http://www.campbellsci.com";
      hotspot_2.useUrl = false;
      hotspot_2.urlTarget = "";
      hotspot_2.buttonText = "Station 2";
      hotspot_2.buttonFont = "bold 17pt Arial";
      hotspot_2.buttonFontDecoration = 1;
      hotspot_2.buttonTextColor = "RGBA(0, 0, 255, 1)";
      hotspot_2.needs_mouse_events = true;
      tab_0.push(hotspot_2);

      var hotspot_3 = new CsiHotSpot(666, 174, 105, 33);
      hotspot_3.bHasBackground = true;
      hotspot_3.bUseClip = true;
      hotspot_3.backgroundMargin = 0;
      hotspot_3.eBackgroundBorderStyle = 0;
      hotspot_3.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      hotspot_3.backgroundBorderThickness = 0;
      hotspot_3.eBackgroundColorStyle = 2;
      hotspot_3.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      hotspot_3.eBackgroundGradientDirection = 2;
      hotspot_3.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      hotspot_3.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      hotspot_3.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      hotspot_3.backgroundGradientUseMid = true;
      hotspot_3.bBackgroundRoundedCorners = true;
      hotspot_3.backgroundRoundedRadius = 8;
      hotspot_3.RotationAngle = 0;
      hotspot_3.IncludeHoverCaption = true;
      hotspot_3.HoverCaption = "Click to Open";
      hotspot_3.url = "http://www.campbellsci.com";
      hotspot_3.useUrl = false;
      hotspot_3.urlTarget = "";
      hotspot_3.buttonText = "Station 3";
      hotspot_3.buttonFont = "bold 17pt Arial";
      hotspot_3.buttonFontDecoration = 1;
      hotspot_3.buttonTextColor = "RGBA(0, 0, 255, 1)";
      hotspot_3.needs_mouse_events = true;
      tab_0.push(hotspot_3);

      var hotspot_4 = new CsiHotSpot(790, 175, 105, 33);
      hotspot_4.bHasBackground = true;
      hotspot_4.bUseClip = true;
      hotspot_4.backgroundMargin = 0;
      hotspot_4.eBackgroundBorderStyle = 0;
      hotspot_4.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      hotspot_4.backgroundBorderThickness = 0;
      hotspot_4.eBackgroundColorStyle = 2;
      hotspot_4.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      hotspot_4.eBackgroundGradientDirection = 2;
      hotspot_4.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      hotspot_4.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      hotspot_4.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      hotspot_4.backgroundGradientUseMid = true;
      hotspot_4.bBackgroundRoundedCorners = true;
      hotspot_4.backgroundRoundedRadius = 8;
      hotspot_4.RotationAngle = 0;
      hotspot_4.IncludeHoverCaption = true;
      hotspot_4.HoverCaption = "Click to Open";
      hotspot_4.url = "http://www.campbellsci.com";
      hotspot_4.useUrl = false;
      hotspot_4.urlTarget = "";
      hotspot_4.buttonText = "Station 4";
      hotspot_4.buttonFont = "bold 17pt Arial";
      hotspot_4.buttonFontDecoration = 1;
      hotspot_4.buttonTextColor = "RGBA(0, 0, 255, 1)";
      hotspot_4.needs_mouse_events = true;
      tab_0.push(hotspot_4);

      var alarmState_1 = new CsiImageAlarm(1038, 280, 101, 72, expressions[3]);
      alarmState_1.RotationAngle = 0;
      alarmState_1.IncludeHoverCaption = false;
      alarmState_1.HoverCaption = "";
      var alarmState_1_offState = alarmState_1.createImageAlarmState('', '', '', '');
      alarmState_1_offState.bHasBackground = true;
      alarmState_1_offState.bUseClip = true;
      alarmState_1_offState.backgroundMargin = 0;
      alarmState_1_offState.eBackgroundBorderStyle = 0;
      alarmState_1_offState.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_offState.backgroundBorderThickness = 0;
      alarmState_1_offState.eBackgroundColorStyle = 1;
      alarmState_1_offState.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_offState.eBackgroundGradientDirection = 2;
      alarmState_1_offState.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_offState.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_1_offState.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_offState.backgroundGradientUseMid = true;
      alarmState_1_offState.bBackgroundRoundedCorners = true;
      alarmState_1_offState.backgroundRoundedRadius = 8;
      alarmState_1_offState.is_off_state = true;
      alarmState_1_offState.bCenterImage = true;
      alarmState_1_offState.bIncludeImage = true;
      alarmState_1_offState.eImageType = 0;
      alarmState_1_offState.imageSize = 80;
      alarmState_1_offState.standardColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_offState.acknowledgedStandardColor = "RGBA(0, 0, 0, 0.35)";
      alarmState_1_offState.bIncludeText = true;
      alarmState_1_offState.textStr = "Off";
      alarmState_1_offState.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_offState.textFont = "bold 17pt Arial";
      alarmState_1_offState.textFontDecoration = 0;
      alarmState_1_offState.bIncludeNumeric = false;
      alarmState_1_offState.numericPrecision = 0;
      alarmState_1_offState.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_offState.numericFont = "bold 17pt Arial";
      alarmState_1_offState.numericFontDecoration = 0;
      alarmState_1_offState.bNumericUnitsSameFont = true;
      alarmState_1_offState.numericUnitStr = "";
      alarmState_1_offState.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_1_offState.numericUnitFont = "14pt Arial";
      alarmState_1_offState.numericUnitFontDecoration = 0;
      alarmState_1_offState.textTextAlignment = "center";
      alarmState_1_offState.textTextBaseline = "top";
      alarmState_1_offState.textTextLocation = new Point(51, 0);
      alarmState_1_offState.numericTextAlignment = "center";
      alarmState_1_offState.numericTextBaseline = "bottom";
      alarmState_1_offState.numericTextLocation = new Point(51, 72);
      alarmState_1_offState.bTextNumericSameLocation = false;
      alarmState_1_offState.audioInterval = 10000;
      alarmState_1_offState.condition = 4;
      alarmState_1_offState.condition_value = 0;
      alarmState_1_offState.condition2 = 0;
      alarmState_1_offState.condition2_value = 0;
      alarmState_1_offState.logic_operand = 0;
      alarmState_1_offState.stop_option = 0;
      alarmState_1_offState.deadband_condition1 = 0;
      alarmState_1_offState.deadband_condition1_value = 0;
      alarmState_1_offState.deadband_logic_operand = 0;
      alarmState_1_offState.deadband_condition2 = 0;
      alarmState_1_offState.deadband_condition2_value = 0;
      var alarmState_1_State_1 = alarmState_1.createImageAlarmState('', 'Alert.wav', 'Alert.mp3', 'Alert.ogg');
      alarmState_1_State_1.bHasBackground = true;
      alarmState_1_State_1.bUseClip = true;
      alarmState_1_State_1.backgroundMargin = 0;
      alarmState_1_State_1.eBackgroundBorderStyle = 0;
      alarmState_1_State_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_1.backgroundBorderThickness = 0;
      alarmState_1_State_1.eBackgroundColorStyle = 1;
      alarmState_1_State_1.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_1.eBackgroundGradientDirection = 2;
      alarmState_1_State_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_1_State_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_1.backgroundGradientUseMid = true;
      alarmState_1_State_1.bBackgroundRoundedCorners = true;
      alarmState_1_State_1.backgroundRoundedRadius = 8;
      alarmState_1_State_1.is_off_state = false;
      alarmState_1_State_1.bCenterImage = true;
      alarmState_1_State_1.bIncludeImage = true;
      alarmState_1_State_1.eImageType = 0;
      alarmState_1_State_1.imageSize = 80;
      alarmState_1_State_1.standardColor = "RGBA(255, 255, 0, 1)";
      alarmState_1_State_1.acknowledgedStandardColor = "RGBA(255, 255, 0, 0.35)";
      alarmState_1_State_1.bIncludeText = true;
      alarmState_1_State_1.textStr = "Low ";
      alarmState_1_State_1.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_1.textFont = "bold 17pt Arial";
      alarmState_1_State_1.textFontDecoration = 0;
      alarmState_1_State_1.bIncludeNumeric = false;
      alarmState_1_State_1.numericPrecision = 0;
      alarmState_1_State_1.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_1.numericFont = "bold 17pt Arial";
      alarmState_1_State_1.numericFontDecoration = 0;
      alarmState_1_State_1.bNumericUnitsSameFont = true;
      alarmState_1_State_1.numericUnitStr = "";
      alarmState_1_State_1.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_1_State_1.numericUnitFont = "14pt Arial";
      alarmState_1_State_1.numericUnitFontDecoration = 0;
      alarmState_1_State_1.textTextAlignment = "center";
      alarmState_1_State_1.textTextBaseline = "top";
      alarmState_1_State_1.textTextLocation = new Point(51, 0);
      alarmState_1_State_1.numericTextAlignment = "center";
      alarmState_1_State_1.numericTextBaseline = "bottom";
      alarmState_1_State_1.numericTextLocation = new Point(51, 72);
      alarmState_1_State_1.bTextNumericSameLocation = false;
      alarmState_1_State_1.audioInterval = 10000;
      alarmState_1_State_1.condition = 4;
      alarmState_1_State_1.condition_value = 1;
      alarmState_1_State_1.condition2 = 0;
      alarmState_1_State_1.condition2_value = 0;
      alarmState_1_State_1.logic_operand = 0;
      alarmState_1_State_1.stop_option = 0;
      alarmState_1_State_1.deadband_condition1 = 0;
      alarmState_1_State_1.deadband_condition1_value = 0;
      alarmState_1_State_1.deadband_logic_operand = 0;
      alarmState_1_State_1.deadband_condition2 = 0;
      alarmState_1_State_1.deadband_condition2_value = 0;
      var alarmState_1_State_2 = alarmState_1.createImageAlarmState('', 'Alarm.wav', 'Alarm.mp3', 'Alarm.ogg');
      alarmState_1_State_2.bHasBackground = true;
      alarmState_1_State_2.bUseClip = true;
      alarmState_1_State_2.backgroundMargin = 0;
      alarmState_1_State_2.eBackgroundBorderStyle = 0;
      alarmState_1_State_2.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_2.backgroundBorderThickness = 0;
      alarmState_1_State_2.eBackgroundColorStyle = 1;
      alarmState_1_State_2.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_2.eBackgroundGradientDirection = 2;
      alarmState_1_State_2.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_2.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_1_State_2.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_2.backgroundGradientUseMid = true;
      alarmState_1_State_2.bBackgroundRoundedCorners = true;
      alarmState_1_State_2.backgroundRoundedRadius = 8;
      alarmState_1_State_2.is_off_state = false;
      alarmState_1_State_2.bCenterImage = true;
      alarmState_1_State_2.bIncludeImage = true;
      alarmState_1_State_2.eImageType = 0;
      alarmState_1_State_2.imageSize = 80;
      alarmState_1_State_2.standardColor = "RGBA(0, 128, 0, 1)";
      alarmState_1_State_2.acknowledgedStandardColor = "RGBA(0, 128, 0, 0.35)";
      alarmState_1_State_2.bIncludeText = true;
      alarmState_1_State_2.textStr = "Medium";
      alarmState_1_State_2.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_2.textFont = "bold 17pt Arial";
      alarmState_1_State_2.textFontDecoration = 0;
      alarmState_1_State_2.bIncludeNumeric = false;
      alarmState_1_State_2.numericPrecision = 0;
      alarmState_1_State_2.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_2.numericFont = "bold 17pt Arial";
      alarmState_1_State_2.numericFontDecoration = 0;
      alarmState_1_State_2.bNumericUnitsSameFont = true;
      alarmState_1_State_2.numericUnitStr = "";
      alarmState_1_State_2.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_1_State_2.numericUnitFont = "14pt Arial";
      alarmState_1_State_2.numericUnitFontDecoration = 0;
      alarmState_1_State_2.textTextAlignment = "center";
      alarmState_1_State_2.textTextBaseline = "top";
      alarmState_1_State_2.textTextLocation = new Point(51, 0);
      alarmState_1_State_2.numericTextAlignment = "center";
      alarmState_1_State_2.numericTextBaseline = "bottom";
      alarmState_1_State_2.numericTextLocation = new Point(51, 72);
      alarmState_1_State_2.bTextNumericSameLocation = false;
      alarmState_1_State_2.audioInterval = 10000;
      alarmState_1_State_2.condition = 4;
      alarmState_1_State_2.condition_value = 2;
      alarmState_1_State_2.condition2 = 0;
      alarmState_1_State_2.condition2_value = 0;
      alarmState_1_State_2.logic_operand = 0;
      alarmState_1_State_2.stop_option = 0;
      alarmState_1_State_2.deadband_condition1 = 0;
      alarmState_1_State_2.deadband_condition1_value = 0;
      alarmState_1_State_2.deadband_logic_operand = 0;
      alarmState_1_State_2.deadband_condition2 = 0;
      alarmState_1_State_2.deadband_condition2_value = 0;
      var alarmState_1_State_3 = alarmState_1.createImageAlarmState('', 'EmergencySiren.wav', 'EmergencySiren.mp3', 'EmergencySiren.ogg');
      alarmState_1_State_3.bHasBackground = true;
      alarmState_1_State_3.bUseClip = true;
      alarmState_1_State_3.backgroundMargin = 0;
      alarmState_1_State_3.eBackgroundBorderStyle = 0;
      alarmState_1_State_3.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_3.backgroundBorderThickness = 0;
      alarmState_1_State_3.eBackgroundColorStyle = 1;
      alarmState_1_State_3.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_3.eBackgroundGradientDirection = 2;
      alarmState_1_State_3.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_3.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_1_State_3.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_1_State_3.backgroundGradientUseMid = true;
      alarmState_1_State_3.bBackgroundRoundedCorners = true;
      alarmState_1_State_3.backgroundRoundedRadius = 8;
      alarmState_1_State_3.is_off_state = false;
      alarmState_1_State_3.bCenterImage = true;
      alarmState_1_State_3.bIncludeImage = true;
      alarmState_1_State_3.eImageType = 0;
      alarmState_1_State_3.imageSize = 80;
      alarmState_1_State_3.standardColor = "RGBA(255, 0, 0, 1)";
      alarmState_1_State_3.acknowledgedStandardColor = "RGBA(255, 0, 0, 0.35)";
      alarmState_1_State_3.bIncludeText = true;
      alarmState_1_State_3.textStr = "High ";
      alarmState_1_State_3.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_3.textFont = "bold 17pt Arial";
      alarmState_1_State_3.textFontDecoration = 0;
      alarmState_1_State_3.bIncludeNumeric = false;
      alarmState_1_State_3.numericPrecision = 0;
      alarmState_1_State_3.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_1_State_3.numericFont = "bold 17pt Arial";
      alarmState_1_State_3.numericFontDecoration = 0;
      alarmState_1_State_3.bNumericUnitsSameFont = true;
      alarmState_1_State_3.numericUnitStr = "";
      alarmState_1_State_3.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_1_State_3.numericUnitFont = "14pt Arial";
      alarmState_1_State_3.numericUnitFontDecoration = 0;
      alarmState_1_State_3.textTextAlignment = "center";
      alarmState_1_State_3.textTextBaseline = "top";
      alarmState_1_State_3.textTextLocation = new Point(51, 0);
      alarmState_1_State_3.numericTextAlignment = "center";
      alarmState_1_State_3.numericTextBaseline = "bottom";
      alarmState_1_State_3.numericTextLocation = new Point(51, 72);
      alarmState_1_State_3.bTextNumericSameLocation = false;
      alarmState_1_State_3.audioInterval = 10000;
      alarmState_1_State_3.condition = 4;
      alarmState_1_State_3.condition_value = 3;
      alarmState_1_State_3.condition2 = 0;
      alarmState_1_State_3.condition2_value = 0;
      alarmState_1_State_3.logic_operand = 0;
      alarmState_1_State_3.stop_option = 0;
      alarmState_1_State_3.deadband_condition1 = 0;
      alarmState_1_State_3.deadband_condition1_value = 0;
      alarmState_1_State_3.deadband_logic_operand = 0;
      alarmState_1_State_3.deadband_condition2 = 0;
      alarmState_1_State_3.deadband_condition2_value = 0;
      alarmState_1.copyBackgroundProps(alarmState_1.alarmStates[0], alarmState_1);
      tab_0.push(alarmState_1);

      var label_2 = new CsiLabel(1021, 236, 135, 33, "Active  Alarm ");
      label_2.bHasBackground = true;
      label_2.bUseClip = true;
      label_2.backgroundMargin = 0;
      label_2.eBackgroundBorderStyle = 0;
      label_2.backgroundBorderColor = "RGBA(255, 255, 255, 1)";
      label_2.backgroundBorderThickness = 0;
      label_2.eBackgroundColorStyle = 0;
      label_2.backgroundSolidColor = "RGBA(0, 0, 128, 1)";
      label_2.eBackgroundGradientDirection = 2;
      label_2.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      label_2.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      label_2.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      label_2.backgroundGradientUseMid = true;
      label_2.bBackgroundRoundedCorners = true;
      label_2.backgroundRoundedRadius = 8;
      label_2.RotationAngle = 0;
      label_2.IncludeHoverCaption = false;
      label_2.HoverCaption = "";
      label_2.font = "bold 17pt Arial";
      label_2.fontDecoration = 0;
      label_2.font_color = "RGBA(255, 255, 255, 1)";
      label_2.displayVertically = false;
      label_2.textAlign = 1;
      label_2.word_wrap = false;
      label_2.border_style = 0;
      tab_0.push(label_2);

      var alarm_1 = new CsiImageAlarm(1111, 176, 38, 35, expressions[2]);
      alarm_1.RotationAngle = 0;
      alarm_1.IncludeHoverCaption = false;
      alarm_1.HoverCaption = "";
      var alarm_1_offState = alarm_1.createCommStatusAlarmState('', '', '', '');
      alarm_1_offState.bHasBackground = true;
      alarm_1_offState.bUseClip = true;
      alarm_1_offState.backgroundMargin = 0;
      alarm_1_offState.eBackgroundBorderStyle = 0;
      alarm_1_offState.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarm_1_offState.backgroundBorderThickness = 0;
      alarm_1_offState.eBackgroundColorStyle = 2;
      alarm_1_offState.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarm_1_offState.eBackgroundGradientDirection = 2;
      alarm_1_offState.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarm_1_offState.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarm_1_offState.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarm_1_offState.backgroundGradientUseMid = true;
      alarm_1_offState.bBackgroundRoundedCorners = true;
      alarm_1_offState.backgroundRoundedRadius = 8;
      alarm_1_offState.is_off_state = true;
      alarm_1_offState.bCenterImage = false;
      alarm_1_offState.bIncludeImage = true;
      alarm_1_offState.eImageType = 0;
      alarm_1_offState.imageSize = 100;
      alarm_1_offState.standardColor = "RGBA(18, 218, 18, 1)";
      alarm_1_offState.acknowledgedStandardColor = "RGBA(18, 218, 18, 0.35)";
      alarm_1_offState.bIncludeText = false;
      alarm_1_offState.textStr = "";
      alarm_1_offState.textColor = "RGBA(0, 0, 0, 1)";
      alarm_1_offState.textFont = "bold 17pt Arial";
      alarm_1_offState.textFontDecoration = 0;
      alarm_1_offState.bIncludeNumeric = false;
      alarm_1_offState.numericPrecision = 1;
      alarm_1_offState.numericColor = "RGBA(0, 0, 0, 1)";
      alarm_1_offState.numericFont = "bold 17pt Arial";
      alarm_1_offState.numericFontDecoration = 0;
      alarm_1_offState.bNumericUnitsSameFont = true;
      alarm_1_offState.numericUnitStr = "";
      alarm_1_offState.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarm_1_offState.numericUnitFont = "14pt Arial";
      alarm_1_offState.numericUnitFontDecoration = 0;
      alarm_1_offState.textTextAlignment = "center";
      alarm_1_offState.textTextBaseline = "bottom";
      alarm_1_offState.textTextLocation = new Point(19, 35);
      alarm_1_offState.numericTextAlignment = "center";
      alarm_1_offState.numericTextBaseline = "middle";
      alarm_1_offState.numericTextLocation = new Point(19, 18);
      alarm_1_offState.bTextNumericSameLocation = false;
      alarm_1_offState.audioInterval = 10000;
      alarm_1_offState.condition = 5;
      alarm_1_offState.condition_value = 0;
      alarm_1_offState.condition2 = 0;
      alarm_1_offState.condition2_value = 0;
      alarm_1_offState.logic_operand = 0;
      alarm_1_offState.stop_option = 0;
      alarm_1_offState.deadband_condition1 = 0;
      alarm_1_offState.deadband_condition1_value = 0;
      alarm_1_offState.deadband_logic_operand = 0;
      alarm_1_offState.deadband_condition2 = 0;
      alarm_1_offState.deadband_condition2_value = 0;
      var alarm_1_onState = alarm_1.createCommStatusAlarmState('', '', '', '');
      alarm_1_onState.bHasBackground = true;
      alarm_1_onState.bUseClip = true;
      alarm_1_onState.backgroundMargin = 0;
      alarm_1_onState.eBackgroundBorderStyle = 0;
      alarm_1_onState.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarm_1_onState.backgroundBorderThickness = 0;
      alarm_1_onState.eBackgroundColorStyle = 2;
      alarm_1_onState.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarm_1_onState.eBackgroundGradientDirection = 2;
      alarm_1_onState.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarm_1_onState.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarm_1_onState.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarm_1_onState.backgroundGradientUseMid = true;
      alarm_1_onState.bBackgroundRoundedCorners = true;
      alarm_1_onState.backgroundRoundedRadius = 8;
      alarm_1_onState.is_off_state = false;
      alarm_1_onState.bCenterImage = false;
      alarm_1_onState.bIncludeImage = true;
      alarm_1_onState.eImageType = 0;
      alarm_1_onState.imageSize = 100;
      alarm_1_onState.standardColor = "RGBA(255, 0, 0, 1)";
      alarm_1_onState.acknowledgedStandardColor = "RGBA(255, 0, 0, 0.35)";
      alarm_1_onState.bIncludeText = false;
      alarm_1_onState.textStr = "communacation status";
      alarm_1_onState.textColor = "RGBA(0, 0, 0, 1)";
      alarm_1_onState.textFont = "bold 17pt Arial";
      alarm_1_onState.textFontDecoration = 0;
      alarm_1_onState.bIncludeNumeric = false;
      alarm_1_onState.numericPrecision = 1;
      alarm_1_onState.numericColor = "RGBA(0, 0, 0, 1)";
      alarm_1_onState.numericFont = "bold 17pt Arial";
      alarm_1_onState.numericFontDecoration = 0;
      alarm_1_onState.bNumericUnitsSameFont = true;
      alarm_1_onState.numericUnitStr = "";
      alarm_1_onState.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarm_1_onState.numericUnitFont = "14pt Arial";
      alarm_1_onState.numericUnitFontDecoration = 0;
      alarm_1_onState.textTextAlignment = "center";
      alarm_1_onState.textTextBaseline = "bottom";
      alarm_1_onState.textTextLocation = new Point(19, 35);
      alarm_1_onState.numericTextAlignment = "center";
      alarm_1_onState.numericTextBaseline = "middle";
      alarm_1_onState.numericTextLocation = new Point(19, 18);
      alarm_1_onState.bTextNumericSameLocation = false;
      alarm_1_onState.audioInterval = 10000;
      alarm_1_onState.condition = 5;
      alarm_1_onState.condition_value = 0;
      alarm_1_onState.condition2 = 0;
      alarm_1_onState.condition2_value = 0;
      alarm_1_onState.logic_operand = 0;
      alarm_1_onState.stop_option = 0;
      alarm_1_onState.deadband_condition1 = 0;
      alarm_1_onState.deadband_condition1_value = 0;
      alarm_1_onState.deadband_logic_operand = 0;
      alarm_1_onState.deadband_condition2 = 0;
      alarm_1_onState.deadband_condition2_value = 0;
      alarm_1.copyBackgroundProps(alarm_1.alarmStates[0], alarm_1);
      tab_0.push(alarm_1);

      var label_3 = new CsiLabel(928, 175, 174, 33, "Communication Status");
      label_3.bHasBackground = true;
      label_3.bUseClip = true;
      label_3.backgroundMargin = 0;
      label_3.eBackgroundBorderStyle = 0;
      label_3.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      label_3.backgroundBorderThickness = 0;
      label_3.eBackgroundColorStyle = 2;
      label_3.backgroundSolidColor = "RGBA(0, 128, 128, 1)";
      label_3.eBackgroundGradientDirection = 2;
      label_3.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      label_3.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      label_3.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      label_3.backgroundGradientUseMid = true;
      label_3.bBackgroundRoundedCorners = true;
      label_3.backgroundRoundedRadius = 8;
      label_3.RotationAngle = 0;
      label_3.IncludeHoverCaption = false;
      label_3.HoverCaption = "";
      label_3.font = "bold 17pt Calibri";
      label_3.fontDecoration = 0;
      label_3.font_color = "RGBA(0, 0, 0, 1)";
      label_3.displayVertically = false;
      label_3.textAlign = 1;
      label_3.word_wrap = false;
      label_3.border_style = 0;
      tab_0.push(label_3);

      var lever_switch_1 = new CsiLeverSwitch(384, 241, 59, 94, expressions[1]);
      lever_switch_1.bHasBackground = true;
      lever_switch_1.bUseClip = true;
      lever_switch_1.backgroundMargin = 0;
      lever_switch_1.eBackgroundBorderStyle = 0;
      lever_switch_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      lever_switch_1.backgroundBorderThickness = 0;
      lever_switch_1.eBackgroundColorStyle = 1;
      lever_switch_1.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      lever_switch_1.eBackgroundGradientDirection = 2;
      lever_switch_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      lever_switch_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      lever_switch_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      lever_switch_1.backgroundGradientUseMid = true;
      lever_switch_1.bBackgroundRoundedCorners = true;
      lever_switch_1.backgroundRoundedRadius = 8;
      lever_switch_1.RotationAngle = 0;
      lever_switch_1.IncludeHoverCaption = false;
      lever_switch_1.HoverCaption = "";
      lever_switch_1.set_uri = "Server:CR300Series.Public.AlarmTrigger";
      lever_switch_1.transparent = false;
      lever_switch_1.off_background_color = "RGBA(192, 192, 192, 1)";
      lever_switch_1.runtime_click_option = 2;
      lever_switch_1.on_write_value = 1;
      lever_switch_1.off_write_value = 0;
      tab_0.push(lever_switch_1);

      var drop_list_1 = new CsiDropList(151, 269, 179, 40, expressions[0]);
      drop_list_1.bHasBackground = true;
      drop_list_1.bUseClip = true;
      drop_list_1.backgroundMargin = 0;
      drop_list_1.eBackgroundBorderStyle = 0;
      drop_list_1.backgroundBorderColor = "RGBA(255, 255, 255, 1)";
      drop_list_1.backgroundBorderThickness = 0;
      drop_list_1.eBackgroundColorStyle = 0;
      drop_list_1.backgroundSolidColor = "RGBA(0, 0, 128, 1)";
      drop_list_1.eBackgroundGradientDirection = 2;
      drop_list_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      drop_list_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      drop_list_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      drop_list_1.backgroundGradientUseMid = true;
      drop_list_1.bBackgroundRoundedCorners = true;
      drop_list_1.backgroundRoundedRadius = 8;
      drop_list_1.RotationAngle = 0;
      drop_list_1.IncludeHoverCaption = false;
      drop_list_1.HoverCaption = "";
      drop_list_1.set_uri = "Server:CR300Series.Public.AlarmSelect";
      drop_list_1.hide_arrow = false;
      drop_list_1.hide_unknown = false;
       drop_list_1.default_background =       {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(255, 255, 255, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
;
      drop_list_1.addLabel("Select Alarm", 
      "0", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(255, 255, 255, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel("Low Alarm", 
      "1", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel("Medium Alarm ", 
      "2", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel("High Alarm ", 
      "3", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel_unknown("Select Alarm", 
      "0", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(255, 255, 255, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel_unknown("Low Alarm", 
      "1", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel_unknown("Medium Alarm ", 
      "2", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel_unknown("High Alarm ", 
      "3", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(192, 192, 192, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      drop_list_1.addLabel_unknown("Unknown_1", 
      "1", 
      {
            backgroundMargin             : 0,
            eBackgroundBorderStyle       : 0,
            backgroundBorderColor        : "RGBA(255, 255, 255, 1.000000)",
            backgroundBorderThickness    : 0,

            eBackgroundColorStyle        : 0,
            backgroundSolidColor         : "RGBA(0, 0, 128, 1.000000)",

            eBackgroundGradientDirection : 2,
            backgroundGradientStartColor : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientMidColor   : "RGBA(240, 240, 240, 1.000000)",
            backgroundGradientEndColor   : "RGBA(192, 192, 192, 1.000000)",
            backgroundGradientUseMid     : 1,

            bBackgroundRoundedCorners  : 1,
            backgroundRoundedRadius    : 8
      }
, 
"bold 17pt Arial", 
"RGBA(255, 255, 255, 1.000000)", 
0);
      tab_0.push(drop_list_1);

      var label_4 = new CsiLabel(153, 228, 179, 40, "Alarm Types ");
      label_4.bHasBackground = true;
      label_4.bUseClip = true;
      label_4.backgroundMargin = 0;
      label_4.eBackgroundBorderStyle = 0;
      label_4.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      label_4.backgroundBorderThickness = 0;
      label_4.eBackgroundColorStyle = 2;
      label_4.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      label_4.eBackgroundGradientDirection = 2;
      label_4.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      label_4.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      label_4.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      label_4.backgroundGradientUseMid = true;
      label_4.bBackgroundRoundedCorners = true;
      label_4.backgroundRoundedRadius = 8;
      label_4.RotationAngle = 0;
      label_4.IncludeHoverCaption = false;
      label_4.HoverCaption = "";
      label_4.font = "bold 17pt Arial";
      label_4.fontDecoration = 0;
      label_4.font_color = "RGBA(0, 128, 128, 1)";
      label_4.displayVertically = false;
      label_4.textAlign = 1;
      label_4.word_wrap = false;
      label_4.border_style = 0;
      tab_0.push(label_4);

      var alarmState_2 = new CsiImageAlarm(1293, 179, 95, 107, null);
      alarmState_2.RotationAngle = 0;
      alarmState_2.IncludeHoverCaption = false;
      alarmState_2.HoverCaption = "";
      var alarmState_2_offState = alarmState_2.createImageAlarmState('', '', '', '');
      alarmState_2_offState.bHasBackground = true;
      alarmState_2_offState.bUseClip = true;
      alarmState_2_offState.backgroundMargin = 0;
      alarmState_2_offState.eBackgroundBorderStyle = 0;
      alarmState_2_offState.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_offState.backgroundBorderThickness = 0;
      alarmState_2_offState.eBackgroundColorStyle = 1;
      alarmState_2_offState.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_offState.eBackgroundGradientDirection = 2;
      alarmState_2_offState.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_offState.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_2_offState.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_offState.backgroundGradientUseMid = true;
      alarmState_2_offState.bBackgroundRoundedCorners = true;
      alarmState_2_offState.backgroundRoundedRadius = 8;
      alarmState_2_offState.is_off_state = false;
      alarmState_2_offState.bCenterImage = true;
      alarmState_2_offState.bIncludeImage = true;
      alarmState_2_offState.eImageType = 0;
      alarmState_2_offState.imageSize = 70;
      alarmState_2_offState.standardColor = "RGBA(117, 70, 70, 1)";
      alarmState_2_offState.acknowledgedStandardColor = "RGBA(117, 70, 70, 0.35)";
      alarmState_2_offState.bIncludeText = true;
      alarmState_2_offState.textStr = "Alarm Off";
      alarmState_2_offState.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_offState.textFont = "bold 17pt Arial";
      alarmState_2_offState.textFontDecoration = 0;
      alarmState_2_offState.bIncludeNumeric = true;
      alarmState_2_offState.numericPrecision = 0;
      alarmState_2_offState.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_offState.numericFont = "bold 17pt Arial";
      alarmState_2_offState.numericFontDecoration = 0;
      alarmState_2_offState.bNumericUnitsSameFont = true;
      alarmState_2_offState.numericUnitStr = "";
      alarmState_2_offState.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_2_offState.numericUnitFont = "14pt Arial";
      alarmState_2_offState.numericUnitFontDecoration = 0;
      alarmState_2_offState.textTextAlignment = "center";
      alarmState_2_offState.textTextBaseline = "top";
      alarmState_2_offState.textTextLocation = new Point(48, 0);
      alarmState_2_offState.numericTextAlignment = "center";
      alarmState_2_offState.numericTextBaseline = "bottom";
      alarmState_2_offState.numericTextLocation = new Point(48, 107);
      alarmState_2_offState.bTextNumericSameLocation = false;
      alarmState_2_offState.audioInterval = 10000;
      alarmState_2_offState.condition = 5;
      alarmState_2_offState.condition_value = 0;
      alarmState_2_offState.condition2 = 0;
      alarmState_2_offState.condition2_value = 0;
      alarmState_2_offState.logic_operand = 0;
      alarmState_2_offState.stop_option = 0;
      alarmState_2_offState.deadband_condition1 = 0;
      alarmState_2_offState.deadband_condition1_value = 0;
      alarmState_2_offState.deadband_logic_operand = 0;
      alarmState_2_offState.deadband_condition2 = 0;
      alarmState_2_offState.deadband_condition2_value = 0;
      var alarmState_2_State_1 = alarmState_2.createImageAlarmState('', 'Alert.wav', 'Alert.mp3', 'Alert.ogg');
      alarmState_2_State_1.bHasBackground = true;
      alarmState_2_State_1.bUseClip = true;
      alarmState_2_State_1.backgroundMargin = 0;
      alarmState_2_State_1.eBackgroundBorderStyle = 0;
      alarmState_2_State_1.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_1.backgroundBorderThickness = 0;
      alarmState_2_State_1.eBackgroundColorStyle = 1;
      alarmState_2_State_1.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_1.eBackgroundGradientDirection = 2;
      alarmState_2_State_1.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_1.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_2_State_1.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_1.backgroundGradientUseMid = true;
      alarmState_2_State_1.bBackgroundRoundedCorners = true;
      alarmState_2_State_1.backgroundRoundedRadius = 8;
      alarmState_2_State_1.is_off_state = false;
      alarmState_2_State_1.bCenterImage = true;
      alarmState_2_State_1.bIncludeImage = true;
      alarmState_2_State_1.eImageType = 0;
      alarmState_2_State_1.imageSize = 70;
      alarmState_2_State_1.standardColor = "RGBA(255, 128, 0, 1)";
      alarmState_2_State_1.acknowledgedStandardColor = "RGBA(255, 128, 0, 0.35)";
      alarmState_2_State_1.bIncludeText = true;
      alarmState_2_State_1.textStr = "Warning";
      alarmState_2_State_1.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_State_1.textFont = "bold 17pt Arial";
      alarmState_2_State_1.textFontDecoration = 0;
      alarmState_2_State_1.bIncludeNumeric = true;
      alarmState_2_State_1.numericPrecision = 0;
      alarmState_2_State_1.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_State_1.numericFont = "bold 17pt Arial";
      alarmState_2_State_1.numericFontDecoration = 0;
      alarmState_2_State_1.bNumericUnitsSameFont = true;
      alarmState_2_State_1.numericUnitStr = "";
      alarmState_2_State_1.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_2_State_1.numericUnitFont = "14pt Arial";
      alarmState_2_State_1.numericUnitFontDecoration = 0;
      alarmState_2_State_1.textTextAlignment = "center";
      alarmState_2_State_1.textTextBaseline = "top";
      alarmState_2_State_1.textTextLocation = new Point(48, 0);
      alarmState_2_State_1.numericTextAlignment = "center";
      alarmState_2_State_1.numericTextBaseline = "bottom";
      alarmState_2_State_1.numericTextLocation = new Point(48, 107);
      alarmState_2_State_1.bTextNumericSameLocation = false;
      alarmState_2_State_1.audioInterval = 10000;
      alarmState_2_State_1.condition = 2;
      alarmState_2_State_1.condition_value = 50;
      alarmState_2_State_1.condition2 = 1;
      alarmState_2_State_1.condition2_value = 75;
      alarmState_2_State_1.logic_operand = 1;
      alarmState_2_State_1.stop_option = 0;
      alarmState_2_State_1.deadband_condition1 = 0;
      alarmState_2_State_1.deadband_condition1_value = 0;
      alarmState_2_State_1.deadband_logic_operand = 0;
      alarmState_2_State_1.deadband_condition2 = 0;
      alarmState_2_State_1.deadband_condition2_value = 0;
      var alarmState_2_State_2 = alarmState_2.createImageAlarmState('', 'EmergencySiren.wav', 'EmergencySiren.mp3', 'EmergencySiren.ogg');
      alarmState_2_State_2.bHasBackground = true;
      alarmState_2_State_2.bUseClip = true;
      alarmState_2_State_2.backgroundMargin = 0;
      alarmState_2_State_2.eBackgroundBorderStyle = 0;
      alarmState_2_State_2.backgroundBorderColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_2.backgroundBorderThickness = 0;
      alarmState_2_State_2.eBackgroundColorStyle = 1;
      alarmState_2_State_2.backgroundSolidColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_2.eBackgroundGradientDirection = 2;
      alarmState_2_State_2.backgroundGradientStartColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_2.backgroundGradientMidColor = "RGBA(240, 240, 240, 1)";
      alarmState_2_State_2.backgroundGradientEndColor = "RGBA(192, 192, 192, 1)";
      alarmState_2_State_2.backgroundGradientUseMid = true;
      alarmState_2_State_2.bBackgroundRoundedCorners = true;
      alarmState_2_State_2.backgroundRoundedRadius = 8;
      alarmState_2_State_2.is_off_state = false;
      alarmState_2_State_2.bCenterImage = true;
      alarmState_2_State_2.bIncludeImage = true;
      alarmState_2_State_2.eImageType = 0;
      alarmState_2_State_2.imageSize = 70;
      alarmState_2_State_2.standardColor = "RGBA(255, 0, 0, 1)";
      alarmState_2_State_2.acknowledgedStandardColor = "RGBA(255, 0, 0, 0.35)";
      alarmState_2_State_2.bIncludeText = true;
      alarmState_2_State_2.textStr = "Critical";
      alarmState_2_State_2.textColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_State_2.textFont = "bold 17pt Arial";
      alarmState_2_State_2.textFontDecoration = 0;
      alarmState_2_State_2.bIncludeNumeric = true;
      alarmState_2_State_2.numericPrecision = 0;
      alarmState_2_State_2.numericColor = "RGBA(0, 0, 0, 1)";
      alarmState_2_State_2.numericFont = "bold 17pt Arial";
      alarmState_2_State_2.numericFontDecoration = 0;
      alarmState_2_State_2.bNumericUnitsSameFont = true;
      alarmState_2_State_2.numericUnitStr = "";
      alarmState_2_State_2.numericUnitColor = "RGBA(0, 0, 139, 1)";
      alarmState_2_State_2.numericUnitFont = "14pt Arial";
      alarmState_2_State_2.numericUnitFontDecoration = 0;
      alarmState_2_State_2.textTextAlignment = "center";
      alarmState_2_State_2.textTextBaseline = "top";
      alarmState_2_State_2.textTextLocation = new Point(48, 0);
      alarmState_2_State_2.numericTextAlignment = "center";
      alarmState_2_State_2.numericTextBaseline = "bottom";
      alarmState_2_State_2.numericTextLocation = new Point(48, 107);
      alarmState_2_State_2.bTextNumericSameLocation = false;
      alarmState_2_State_2.audioInterval = 10000;
      alarmState_2_State_2.condition = 2;
      alarmState_2_State_2.condition_value = 75;
      alarmState_2_State_2.condition2 = 0;
      alarmState_2_State_2.condition2_value = 0;
      alarmState_2_State_2.logic_operand = 0;
      alarmState_2_State_2.stop_option = 0;
      alarmState_2_State_2.deadband_condition1 = 0;
      alarmState_2_State_2.deadband_condition1_value = 0;
      alarmState_2_State_2.deadband_logic_operand = 0;
      alarmState_2_State_2.deadband_condition2 = 0;
      alarmState_2_State_2.deadband_condition2_value = 0;
      alarmState_2.copyBackgroundProps(alarmState_2.alarmStates[0], alarmState_2);
      tab_0.push(alarmState_2);

      graphicsManager.addTab(tab_0);


      graphicsManager.start();
   }
   else
   {
      $('#canvas_container').prepend('<div>This browser does not support the HTML 5 canvas.</br>Please install the latest version of your browser and try again.</div>');
   }
}

