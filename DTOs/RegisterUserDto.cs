using System.ComponentModel.DataAnnotations;

namespace DoctorAPI.DTOs
{
    public class RegisterUserDto
    {
        [Required]
        [MinLength(2)]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;
    }
}