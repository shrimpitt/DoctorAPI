using System.Threading.Tasks;

namespace DoctorAPI.Services
{
    public interface IWhatsAppNotifier
    {
        Task SendNotificationAsync(string message);
    }
}
