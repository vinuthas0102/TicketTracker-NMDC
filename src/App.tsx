import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Plus, Search } from 'lucide-react';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';

export default function App() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTicket, setEditTicket] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTickets(data);
  };

  const handleSave = async (ticket: any) => {
    if (editTicket) {
      await supabase.from('tickets').update(ticket).eq('id', editTicket.id);
    } else {
      await supabase.from('tickets').insert([ticket]);
    }
    fetchTickets();
    setShowForm(false);
    setEditTicket(null);
  };

  const handleEdit = (ticket: any) => {
    setEditTicket(ticket);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tickets').delete().eq('id', id);
    fetchTickets();
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">TicketTracker - NMDC</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={() => { setShowForm(true); setEditTicket(null); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> New Ticket
          </button>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {showForm && (
          <TicketForm
            ticket={editTicket}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTicket(null); }}
          />
        )}

        <TicketList
          tickets={filteredTickets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
