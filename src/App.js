// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useState } from "react";
import { useEffect } from "react";

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromSelect, setFromSelect] = useState("CAD");
  const [toSelect, setToSelect] = useState("INR");
  const [rates, setRates] = useState([]);

  useEffect(function () {
    const controller = new AbortController();
    async function fetchCurrency() {
      try {
        const res = await fetch(`https://api.frankfurter.app/latest`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Something went wrong with fetching");

        const data = await res.json();
        setRates(Object.keys(data.rates));
        console.log(rates);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message);
        }
      }
    }

    fetchCurrency();

    return function () {
      controller.abort();
    };
  }, []);

  return (
    <div>
      <Input amount={amount} setAmount={setAmount} />
      <Select rates={rates} value={fromSelect} onChange={setFromSelect} />
      <Select rates={rates} value={toSelect} onChange={setToSelect} />
      <Output amount={amount} fromSelect={fromSelect} toSelect={toSelect} />
    </div>
  );
}

function Input({ amount, setAmount }) {
  return (
    <>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </>
  );
}

function Select({ rates, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {rates?.map((rate) => (
        <option value={rate} key={rate}>
          {rate}
        </option>
      ))}
    </select>
  );
}

function Output({ amount, fromSelect, toSelect }) {
  const [output, setOutput] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchCurrency() {
        try {
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${fromSelect}&to=${toSelect}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong with converting");

          const data = await res.json();
          setOutput(data.rates[toSelect]);
          console.log(output);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
          }
        }
      }

      fetchCurrency();

      return function () {
        controller.abort();
      };
    },
    [amount, toSelect, fromSelect, output]
  );
  return <p>Output is {output}</p>;
}
