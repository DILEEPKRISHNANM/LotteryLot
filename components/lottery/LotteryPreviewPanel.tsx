"use client";

import { X, Printer, Plus, SaveIcon } from "lucide-react";
import { LotteryResultGridItem } from "./lotteryGridUtils";
import { useState } from "react";

interface LotteryPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: LotteryResultGridItem | null;
  onPrint?: (result: LotteryResultGridItem) => void;
}

export function LotteryPreviewPanel({
  isOpen,
  onClose,
  result,
  onPrint,
}: LotteryPreviewPanelProps) {
  const [ticketRanges, setTicketRanges] = useState<any[]>([]);
  const [showAddRangeOverlay, setShowAddRangeOverlay] = useState(false);
  const [rangeInputs, setRangeInputs] = useState<any>([]);
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint(result);
    } else {
      // Default print behavior
      window.print();
    }
  };
  const handleAddRange = () => {
    setShowAddRangeOverlay(!showAddRangeOverlay);
  };

  const handleAddNewInputPair = () => {
    const newInputPair = {
      id: Date.now().toString(),
      start: "",
      end: "",
    };
    setRangeInputs([...rangeInputs, newInputPair]);
  };

  const handleInputChange = (value: string, field: string, id: string) => {
    setRangeInputs(
      rangeInputs.map((range: any) =>
        range.id === id ? { ...range, [field]: value } : range
      )
    );
  };

  const handleRemoveInput = (id: string) => {
    setRangeInputs(rangeInputs.filter((range: any) => range.id !== id));
  };

  const handleSaveRange = (id: string) => {
    const input = rangeInputs.find((inp: any) => inp.id === id);
    if ((input && (input?.start).trim()) || input?.end.trim()) {
      setTicketRanges([
        ...ticketRanges,
        {
          id: Date.now().toString(),
          start: (input?.start || "").trim(),
          end: (input?.end || "").trim(),
        },
      ]);
    }
  };

  return (
    <>
      {/* Light Backdrop */}
      {/* <div
        className="fixed inset-0 bg-black bg-opacity-10 z-40"
        onClick={onClose}
      /> */}

      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl">
        <div className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {result.draw_name || "Lottery Result"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {result.draw_code} •{" "}
                {new Date(result.draw_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  title="Add Range"
                  className="cursor-pointer mt-1.5"
                  onClick={handleAddRange}
                >
                  <Plus size={20} />
                </button>
                {showAddRangeOverlay && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white shadow-xl rounded-lg p-4 min-w-[500px] border border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Add Range
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAddNewInputPair}
                          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition cursor-pointer "
                        >
                          <Plus size={20} />
                        </button>
                        <button
                          onClick={() => setShowAddRangeOverlay(false)}
                          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {rangeInputs.map((range: any) => {
                        return (
                          <div
                            key={range.id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Range
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="Start Range"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={range.start}
                              onChange={(e) =>
                                handleInputChange(
                                  e.target.value,
                                  "start",
                                  range.id
                                )
                              }
                            />
                            <input
                              type="text"
                              placeholder="End Range"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={range.end}
                              onChange={(e) =>
                                handleInputChange(
                                  e.target.value,
                                  "end",
                                  range.id
                                )
                              }
                            />
                            <button
                              onClick={() => handleRemoveInput(range.id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                              title="Remove"
                            >
                              <X size={20} />
                            </button>
                            <button
                              onClick={() => handleSaveRange(range.id)}
                              disabled={
                                !range.start.trim() || !range.end.trim()
                              }
                              className="cursor-pointer text-green-500 hover:text-green-700"
                            >
                              <SaveIcon size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Draw Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Draw Information
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-base text-gray-900">
                      {new Date(result.draw_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Draw Name
                    </dt>
                    <dd className="text-base text-gray-900">
                      {result.draw_name || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Draw Code
                    </dt>
                    <dd className="text-base text-gray-900">
                      {result.draw_code || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* First Prize */}
              {result.first && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    First Prize
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-blue-700">
                        Ticket:
                      </span>
                      <span className="ml-2 text-lg font-bold text-blue-900">
                        {result.first.ticket}
                      </span>
                    </div>
                    {result.first.location && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">
                          Location:
                        </span>
                        <span className="ml-2 text-blue-900">
                          {result.first.location}
                        </span>
                      </div>
                    )}
                    {result.first.agent && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">
                          Agent:
                        </span>
                        <span className="ml-2 text-blue-900">
                          {result.first.agent}
                        </span>
                      </div>
                    )}
                    {result.first.agency_no && (
                      <div>
                        <span className="text-sm font-medium text-blue-700">
                          Agency No:
                        </span>
                        <span className="ml-2 text-blue-900">
                          {result.first.agency_no}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Prizes */}
              {result.prizes && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Other Prizes
                  </h3>

                  {/* Prize Amounts */}
                  {result.prizes.amounts && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Prize Amounts
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(result.prizes.amounts).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium text-gray-900">
                                {value}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prize Numbers */}
                  {Object.entries(result.prizes)
                    .filter(([key]) => key !== "amounts" && key !== "guess")
                    .map(([prize, numbers]) => (
                      <div
                        key={prize}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-700 mb-2">
                          {prize.charAt(0).toUpperCase() + prize.slice(1)} Prize
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(numbers) &&
                            numbers.map((num, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-800"
                              >
                                {num}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
