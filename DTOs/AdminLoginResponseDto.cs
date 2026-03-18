namespace DoctorAPI.DTOs
{
    public class AdminLoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public long AdminId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}