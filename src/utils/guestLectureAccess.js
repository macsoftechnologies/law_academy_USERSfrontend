export const checkFreeGuestLectureAccess = (courses) => {
  if (!Array.isArray(courses)) return false;
  return courses.some(course => course.enroll_type === 'full-course');
};
