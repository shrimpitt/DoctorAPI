namespace DoctorAPI.DTOs
{
    public class AvailableSlotsByDateDto
    {
        public string Date { get; set; } = string.Empty;
        public List<AvailableSlotItemDto> Slots { get; set; } = new();
    }
}
