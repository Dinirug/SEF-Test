FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["UniReserve.Api.csproj", "./"]
RUN dotnet restore "UniReserve.Api.csproj"

COPY . .
RUN dotnet publish "UniReserve.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080;http://+:80;http://+:5000
EXPOSE 8080 80 5000

ENTRYPOINT ["dotnet", "UniReserve.Api.dll"]
