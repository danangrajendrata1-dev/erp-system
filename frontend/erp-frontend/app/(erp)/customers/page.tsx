"use client";

import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";

import {

  getCustomers,
  createCustomer,
  deleteCustomer

} from "@/services/customer";

export default function CustomersPage() {

  useAuth();

  const [customers, setCustomers] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const loadCustomers = async () => {

    try {

      const data =
        await getCustomers();

      setCustomers(data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    loadCustomers();

  }, []);

  const handleCreate = async () => {

    try {

      await createCustomer({

        name,
        phone,
        address

      });

      setName("");
      setPhone("");
      setAddress("");

      loadCustomers();

    } catch (error) {

      console.log(error);
    }
  };

  const handleDelete =
    async (id: number) => {

      try {

        await deleteCustomer(id);

        loadCustomers();

      } catch (error) {

        console.log(error);
      }
  };

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">

        Customers

      </h1>

      <div className="bg-white p-6 rounded-2xl shadow mb-6">

        <div className="grid grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Customer Name"
            className="border p-3 rounded-lg"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Phone"
            className="border p-3 rounded-lg"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
          />

        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-black text-white px-5 py-3 rounded-lg"
        >
          Add Customer
        </button>

      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                ID
              </th>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                Address
              </th>

              <th className="p-4 text-left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr
                key={customer.id}
                className="border-t"
              >

                <td className="p-4">
                  {customer.id}
                </td>

                <td className="p-4">
                  {customer.name}
                </td>

                <td className="p-4">
                  {customer.phone}
                </td>

                <td className="p-4">
                  {customer.address}
                </td>

                <td className="p-4">

                  <button
                    onClick={() =>
                      handleDelete(
                        customer.id
                      )
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}