import React, { useState } from "react";
import api from "../services/api";

export default function UpdateStockModal({ book, onClose, onUpdate }) {
    const [stock, setStock] = useState(book.stock || 0);
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);
        try {
            await api.put(`/books/${book.id}/stock`, { stock });
            onUpdate(); // refresh list
            onClose();
        } catch (e) {
            alert("Failed to update stock: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h3 className="text-lg font-bold mb-4">Update Stock</h3>
                <p className="text-sm text-gray-600 mb-2">{book.title}</p>

                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full border p-2 rounded mb-4"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 py-1 bg-amber-700 text-white rounded hover:bg-amber-800"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

