using System;
using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class BulkSlotItemDto
    {
        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }
    }
}