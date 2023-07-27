# FunctionSet

## Methods

- add(...funcs: FuncAny[]): Adds functions to the set.
- remove(func: FuncAny): Removes a function from the set.
- get(name: string): Gets a function from the set by its name.
- list(): Returns an array of all functions in the set.
- names(): Returns an array of all function names in the set.
- asObjectList(): Returns an array of all functions in the set as objects.
- asTypeScript(): Returns a string representation of all functions in the set in TypeScript format.
- has(name: string): Checks if a function with the given name exists in the set.
- length(): Returns the number of functions in the set.
- isEmpty(): Checks if the set is empty.
- call(name: string, arg: string): Calls a function in the set by its name with the given argument.
- semantics(): Returns an array of all functions in the set with their names and descriptions.
- search(query: string, topK: number): Searches for functions in the set based on a query and returns the top K results.
- static create(options: FuncAny[] | FunctionSet | undefined): Creates a new FunctionSet with the given options.
