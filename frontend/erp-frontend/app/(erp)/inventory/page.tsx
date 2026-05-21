"use client";

import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";

import {

  getInventory,
  createInventory,
  deleteInventory

} from "@/services/inventory";

export default function InventoryPage() {

  useAuth();

  const [items, setItems] =
    useState<any[]>([]);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [price, setPrice] =
    useState("");

  const loadInventory = async () => {

    try {

      const data =
        await getInventory();

      setItems(data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    loadInventory();

  }, []);

  const handleCreate = async () => {

    try {

      await createInventory({

        name,
        category,
        stock: Number(stock),
        price: Number(price)

      });

      setName("");
      setCategory("");
      setStock("");
      setPrice("");

      loadInventory();

    } catch (error) {

      console.log(error);
    }
  };

  const handleDelete =
    async (id: number) => {

      try {

        await deleteInventory(id);

        loadInventory();

      } catch (error) {

        console.log(error);
      }
  };

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">

        Inventory

      </h1>

      <div className="bg-white p-6 rounded-2xl shadow mb-6">

        <div className="grid grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Item Name"
            className="border p-3 rounded-lg"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Category"
            className="border p-3 rounded-lg"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Stock"
            className="border p-3 rounded-lg"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Price"
            className="border p-3 rounded-lg"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />

        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-black text-white px-5 py-3 rounded-lg"
        >
          Add Item
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
                Category
              </th>

              <th className="p-4 text-left">
                Stock
              </th>

              <th className="p-4 text-left">
                Price
              </th>

              <th className="p-4 text-left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item) => (

              <tr
                key={item.id}
                className="border-t"
              >

                <td className="p-4">
                  {item.id}
                </td>

                <td className="p-4">
                  {item.name}
                </td>

                <td className="p-4">
                  {item.category}
                </td>

                <td className="p-4">
                  {item.stock}
                </td>

                <td className="p-4">
                  Rp {item.price}
                </td>

                <td className="p-4">

                  <button
                    onClick={() =>
                      handleDelete(
                        item.id
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