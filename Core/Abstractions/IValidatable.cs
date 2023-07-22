namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IValidatable
{
    public bool Validate(ICollection<string>? errors = default);
}