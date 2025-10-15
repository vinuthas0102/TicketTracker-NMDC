import { Edit2, Trash2, Clock, User } from 'lucide-react';

interface TicketListProps {
  tickets: any[];
  onEdit: (ticket: any) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function TicketList({ tickets, onEdit, onDelete }: TicketListProps) {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold">{ticket.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(ticket)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(ticket.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {ticket.description && (
            <p className="text-gray-600 mb-3">{ticket.description}</p>
          )}

          <div className="flex gap-2 flex-wrap items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status as keyof typeof statusColors]}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
              {ticket.priority}
            </span>
            {ticket.assigned_to && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <User size={16} /> {ticket.assigned_to}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
              <Clock size={16} /> {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}

      {tickets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tickets found. Create your first ticket to get started.
        </div>
      )}
    </div>
  );
}
