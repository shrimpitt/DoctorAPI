using System;
using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class UpdateDoctorScheduleSlotDto
    {
        [Required]
        public long ConsultationTypeId { get; set; }

        [Required]
        public DateTime SlotDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }
    }
}