using System.ComponentModel.DataAnnotations.Schema;

namespace DoctorAPI.Models
{
    [Table("settings")]
    public class Setting
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("key")]
        public string Key { get; set; }

        [Column("value")]
        public string? Value { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}