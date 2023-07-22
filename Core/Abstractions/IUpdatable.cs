namespace KolibSoft.Catalogue.Core.Abstractions;

public interface IUpdatable<in T>
{
    public void Update(T newState);
}