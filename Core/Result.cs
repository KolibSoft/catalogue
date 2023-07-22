using KolibSoft.Catalogue.Core.Abstractions;

namespace KolibSoft.Catalogue.Core;

public class Result<T> : IResult<T>
{

    public T? Data { get; init; }
    public string[]? Errors { get; init; }

    public static implicit operator Result<T>(T? data) => new() { Data = data };
    public static implicit operator Result<T>(string[]? errors) => new() { Errors = errors };

    public static implicit operator T?(Result<T> result) => result.Data;
    public static implicit operator string[]?(Result<T> result) => result.Errors;

}