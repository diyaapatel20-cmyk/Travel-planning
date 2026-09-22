import React, { useState } from 'react';
import { Compass, Calendar, IndianRupee, MapPin, Users, Car, ArrowLeft, ArrowRight } from 'lucide-react';
import { appStore } from '../lib/database/store';

interface CreateTripPageProps {
  onNavigate: (route: string) => void;
}

export const CreateTripPage: React.FC<CreateTripPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('Ahmedabad Heritage & Culture Tour');
  const [destination, setDestination] = useState('Ahmedabad');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-17');
  const [budget, setBudget] = useState('5000');
  const [transport, setTransport] = useState<'Walking' | 'Public Transport' | 'Bike' | 'Car' | 'Taxi'>('Taxi');
  const [travelStyle, setTravelStyle] = useState<'Budget Friendly' | 'Moderate' | 'Premium'>('Moderate');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip = appStore.createTrip({
      name,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget: Number(budget),
      currency: 'INR',
      transport
    });

    onNavigate(`/trip/${newTrip.id}/overview`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => onNavigate('/dashboard')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            New Expedition
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Create a New Group Journey</h1>
          <p className="text-xs text-stone-500 mt-1">
            Define your foundational travel boundaries. Once created, you can invite group members to register preferences.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Trip Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmedabad Group Trip"
              required
              className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ahmedabad"
                  required
                  className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Total Target Budget (INR)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Preferred Transportation</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Walking', 'Public Transport', 'Bike', 'Car', 'Taxi'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
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

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-sm flex items-center gap-2"
            >
              <span>Create Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
