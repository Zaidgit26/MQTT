import React from "react";
import "./Mqttdata.css";

const Mqttdata = ({ data }) => {
  const parsedData = [];

  try {
    const json = JSON.parse(data);
    if (!json.data) return <p>No data Found</p>;
    let index = 1;
    for (const key in json.data) {
      parsedData.push({
        index: index++,
        name: key,
        value: json.data[key],
      });
    }
  } catch (err) {
    return <p>Waiting For Data...</p>;
  }

  return (
    <div className="data-table">
      <div className="table-header">
        <div>Index</div>
        <div>Parameter</div>
        <div>Value</div>
      </div>
      <div className="table-body">
        {parsedData.map((item) => (
          <div key={item.index} className="table-row">
            <div>{item.index}</div>
            <div>{item.name}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mqttdata;
