import React, { useState } from 'react';
import {
  Settings,
  IndianRupee,
  Calendar,
  Car,
  Trash2,
  LogOut,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { Trip, TripMember } from '../../types';
import { appStore } from '../../lib/database/store';

interface TripSettingsProps {
  trip: Trip;
  members: TripMember[];
  onTripDeleted?: () => void;
}

export const TripSettings: React.FC<TripSettingsProps> = ({
  trip,
  members,
  onTripDeleted
}) => {
  const currentUser = appStore.currentUser;
  const isOwner = trip.created_by === currentUser.id;

  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [budget, setBudget] = useState(trip.budget);
  const [transport, setTransport] = useState(trip.transport);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    appStore.updateTripDetails(trip.id, {
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget: Number(budget),
      transport
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteTrip = () => {
    appStore.deleteTrip(trip.id);
    if (onTripDeleted) onTripDeleted();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs" id="trip-settings-panel">
      <div className="border-b border-stone-100 pb-4">
        <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          Journey Settings
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Adjust the overall group constraints. Changes will automatically trigger a re-evaluation of the living itinerary.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-stone-700 block mb-1">Trip Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Total Group Budget (INR)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-stone-700 block mb-1">Primary Mode of Transport</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(['Walking', 'Public Transport', 'Bike', 'Car', 'Taxi'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTransport(t)}
                className={`py-2 px-1 rounded-xl text-center font-semibold transition-colors ${
                  transport === t
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-stone-100">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs shadow-sm"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Journey</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Are you sure you want to delete this journey?
          </div>
          <p className="text-[11px] text-red-700">
            This action cannot be undone and will remove the shared itinerary and chat records for all members.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDeleteTrip}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
            >
              Confirm Deletion
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
