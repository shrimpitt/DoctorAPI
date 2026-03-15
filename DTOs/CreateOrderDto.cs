namespace DoctorAPI.DTOs
{
    public class CreateOrderDto
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }
        public string? City { get; set; }
        public string? AddressLine { get; set; }
        public string? Comment { get; set; }
        public List<CreateOrderItemDto> Items { get; set; }
    }
}