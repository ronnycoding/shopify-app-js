/**
 * A class that represents a set of access token scopes.
 */
class AuthScopes {
  public static SCOPE_DELIMITER = ',';

  private compressedScopes: Set<string>;
  private expandedScopes: Set<string>;
  private originalScopes: Set<string>;

  constructor(scopes: string | string[] | AuthScopes | undefined) {
    let scopesArray: string[] = [];
    if (typeof scopes === 'string') {
      scopesArray = scopes.split(
        new RegExp(`${AuthScopes.SCOPE_DELIMITER}\\s*`),
      );
    } else if (Array.isArray(scopes)) {
      scopesArray = scopes;
    } else if (scopes) {
      scopesArray = Array.from(scopes.expandedScopes);
    }

    scopesArray = scopesArray
      .map((scope) => scope.trim())
      .filter((scope) => scope.length);

    const impliedScopes = this.getImpliedScopes(scopesArray);

    const scopeSet = new Set(scopesArray);
    const impliedSet = new Set(impliedScopes);

    this.compressedScopes = new Set(
      [...scopeSet].filter((x) => !impliedSet.has(x)),
    );
    this.expandedScopes = new Set([...scopeSet, ...impliedSet]);
    this.originalScopes = scopeSet;
  }

  /**
   * Checks whether the current set of scopes includes the given one.
   */
  public has(scope: string | string[] | AuthScopes | undefined) {
    let other: AuthScopes;

    if (scope instanceof AuthScopes) {
      other = scope;
    } else {
      other = new AuthScopes(scope);
    }

    return (
      other.toArray().filter((x) => !this.expandedScopes.has(x)).length === 0
    );
  }

  /**
   * Checks whether the current set of scopes equals the given one.
   */
  public equals(otherScopes: string | string[] | AuthScopes | undefined) {
    let other: AuthScopes;

    if (otherScopes instanceof AuthScopes) {
      other = otherScopes;
    } else {
      other = new AuthScopes(otherScopes);
    }

    return (
      this.compressedScopes.size === other.compressedScopes.size &&
      this.toArray().filter((x) => !other.has(x)).length === 0
    );
  }

  /**
   * Returns a comma-separated string with the current set of scopes.
   */
  public toString() {
    return this.toArray().join(AuthScopes.SCOPE_DELIMITER);
  }

  /**
   * Returns an array with the current set of scopes.
   */
  public toArray(returnOriginalScopes = false) {
    return returnOriginalScopes
      ? [...this.originalScopes]
      : [...this.compressedScopes];
  }

  private getImpliedScopes(scopesArray: string[]): string[] {
    return scopesArray.reduce((array: string[], current: string) => {
      const matches = current.match(/^(unauthenticated_)?write_(.*)$/);
      if (matches) {
        array.push(`${matches[1] ? matches[1] : ''}read_${matches[2]}`);
      }

      return array;
    }, []);
  }
}

export {AuthScopes};
