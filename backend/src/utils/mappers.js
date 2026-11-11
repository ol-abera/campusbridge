// Convert database rows (snake_case) into the JSON the frontend expects (camelCase).
export const userToJson = (r) => ({
  id: String(r.id),
  fullName: r.full_name,
  email: r.email,
  university: r.university || '',
  yearOfStudy: r.year_of_study || '',
  field: r.field || '',
  phone: r.phone || '',
  bio: r.bio || '',
  role: r.role || 'student',
  createdAt: r.created_at
});

export const applicationToJson = (r, { full = false } = {}) => {
  const base = {
    id: String(r.id),
    opportunityId: r.opportunity_id,
    positionTitle: r.position_title,
    company: r.company,
    status: r.status,
    submittedAt: r.submitted_at
  };
  if (!full) return base;
  return {
    ...base,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    university: r.university,
    yearOfStudy: r.year_of_study,
    coverLetter: r.cover_letter,
    portfolioUrl: r.portfolio_url,
    updatedAt: r.updated_at
  };
};
