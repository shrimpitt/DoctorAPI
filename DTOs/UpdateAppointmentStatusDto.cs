using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class UpdateAppointmentStatusDto
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression(
            "^(pending|confirmed|cancelled|completed)$",
            ErrorMessage = "Allowed values: pending, confirmed, cancelled, completed"
        )]
        public string Status { get; set; } = string.Empty;
    }
}