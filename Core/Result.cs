using System.Text.Json.Serialization;
using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public struct Result<T>
{

    public T? Data { get; } = default;
    public string[] Errors { get; } = Array.Empty<string>();

    [JsonIgnore]
    public bool Ok => Errors.Length == 0;

    public Result(T? data)
    {
        Data = data;
        Errors = Array.Empty<string>();
    }

    public Result(params string[] errors)
    {
        Data = default;
        Errors = errors;
    }

    public static implicit operator Result<T>(T? data) => new(data);
    public static implicit operator Result<T>(string[] errors) => new(errors);

    public static implicit operator T?(Result<T> result) => result.Data;
    public static implicit operator string[](Result<T> result) => result.Errors;

}