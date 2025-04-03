// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useState } from "react";
import { useEffect } from "react";

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromSelect, setFromSelect] = useState("CAD");
  const [toSelect, setToSelect] = useState("INR");
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    const controller = new AbortController();
    async function fetchCurrency() {
      try {
        setLoading(true);

        setError("");

        const res = await fetch(`https://api.frankfurter.app/latest`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Something went wrong with fetching");

        const data = await res.json();
        setRates(Object.keys(data.rates));

        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCurrency();

    return function () {
      controller.abort();
    };
  }, []);

  return (
    <main className="h-screen w-full flex items-center justify-center p-2">
      <div className="w-full h-full max-w-lg max-h-fit bg-slate-600 p-6 rounded-xl flex flex-col gap-4">
        <Input amount={amount} setAmount={setAmount} loading={loading} />
        <div className="flex justify-center gap-5">
          <Select
            rates={rates}
            value={fromSelect}
            onChange={setFromSelect}
            loading={loading}
          />
          <Select
            rates={rates}
            value={toSelect}
            onChange={setToSelect}
            loading={loading}
          />
        </div>
        {loading && <Loader />}
        {!loading && (
          <Output amount={amount} fromSelect={fromSelect} toSelect={toSelect} />
        )}
        {error && <Error message={error} />}
      </div>
    </main>
  );
}

function Input({ amount, setAmount, loading }) {
  return (
    <>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="outline-none p-3 text-xl max-w-50 block mx-auto"
        disabled={loading}
      />
    </>
  );
}

function Select({ rates, value, onChange, loading }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="outline-none p-2"
      disabled={loading}
    >
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
  const [loading, setLoading] = useState(false);

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchCurrency() {
        try {
          setLoading(true);

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
        } finally {
          setLoading(false);
        }
      }

      if (fromSelect === toSelect) {
        return setOutput(amount);
      }

      fetchCurrency();

      return function () {
        controller.abort();
      };
    },
    [amount, toSelect, fromSelect]
  );

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <h1 className="text-2xl font-semibold text-center text-white">
          Output is {output} {toSelect}
        </h1>
      )}
    </>
  );
}

function Loader() {
  return (
    <h1 className="text-2xl font-semibold text-center text-white">
      Converting...
    </h1>
  );
}

function Error() {
  return (
    <h1 className="text-2xl font-semibold text-center text-white">
      Something went wrong
    </h1>
  );
}
