namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IResult<out T>
{
    public T? Data { get; }
    public string[]? Errors { get; }
}