import React, { useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';


const { MonthPicker } = DatePicker;

export const MonthDayPicker = ({ onChange }) => {
  const [date, setDate] = useState(null);

  const handleChange = (date) => {
    setDate(date);
    onChange(date);
  };

  return (
      <MonthPicker
        value={date}
        onChange={handleChange}
        picker="date"
        format="DD/MM"
        disabledDate={(current) => current && current > moment().endOf('day')}
        placeholder="Enter day and month"
      />
  );
};

