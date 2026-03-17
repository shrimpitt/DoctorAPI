using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class CreateAppointmentDto
    {
        [Range(1, long.MaxValue, ErrorMessage = "Consultation type is required")]
        public long ConsultationTypeId { get; set; }

        [Range(1, long.MaxValue, ErrorMessage = "Schedule slot is required")]
        public long ScheduleSlotId { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [MinLength(2, ErrorMessage = "Full name must be at least 2 characters")]
        [StringLength(150, ErrorMessage = "Full name cannot exceed 150 characters")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required")]
        [Phone(ErrorMessage = "Phone format is invalid")]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email format is invalid")]
        public string? Email { get; set; }

        [StringLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters")]
        public string? Comment { get; set; }
    }
}