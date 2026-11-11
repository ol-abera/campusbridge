import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Banknote,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';

export default function OpportunityCard({ opportunity }) {
  // deadline arrives as "YYYY-MM-DD"; adding a time avoids a one-day shift caused by time zones.
  const deadline = opportunity.deadline
    ? new Date(`${opportunity.deadline}T12:00:00`)
    : null;

  const remainingMs = deadline
    ? deadline.getTime() - Date.now()
    : null;

  const isValidDeadline =
    deadline && !Number.isNaN(deadline.getTime());

  const isUrgent =
    isValidDeadline &&
    remainingMs >= 0 &&
    remainingMs <= 14 * 24 * 60 * 60 * 1000;

  const formattedDeadline = isValidDeadline
    ? deadline.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      to={`/opportunities/${opportunity.id}`}
      className="opportunity-card"
    >
      <div className="opportunity-card-top">
        <span className="opportunity-type">
          {opportunity.type}
        </span>

        {opportunity.isClosed && (
          <span className="opportunity-closed">Closed</span>
        )}

        {isUrgent && !opportunity.isClosed && (
          <span className="opportunity-urgent">
            Closing soon
          </span>
        )}
      </div>

      <div className="opportunity-card-content">
        <p className="opportunity-category">
          {opportunity.category}
        </p>

        <h3 className="opportunity-title">
          {opportunity.title}
        </h3>

        <p className="opportunity-company">
          {opportunity.company}
        </p>

        <p className="opportunity-description">
          {opportunity.description}
        </p>
      </div>

      <div className="opportunity-details">
        <span>
          <MapPin size={15} />
          {opportunity.location}
        </span>

        <span>
          <Clock size={15} />
          {opportunity.duration}
        </span>

        <span>
          <Banknote size={15} />
          {opportunity.stipend}
        </span>
      </div>

      <div className="opportunity-card-footer">
        <div className="opportunity-deadline">
          {formattedDeadline && (
            <>
              <CalendarDays size={15} />
              <span>{opportunity.isClosed ? 'Closed' : 'Apply by'} {formattedDeadline}</span>
            </>
          )}
        </div>

        <span className="opportunity-view-link">
          View details
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}