using UniReserve.Api.Models;

namespace UniReserve.Api.Services;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
