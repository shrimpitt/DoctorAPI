using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class CreateBulkDoctorScheduleSlotsDto
    {
        [Required]
        public long ConsultationTypeId { get; set; }

        [Required]
        public DateTime SlotDate { get; set; }

        [Required]
        public List<BulkSlotItemDto> Slots { get; set; } = new();
    }
}