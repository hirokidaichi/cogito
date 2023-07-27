# FunctionSet.tsの説明

## クラス: FunctionSet

### メソッド:

- `add(funcs: FuncAny[])`: funcsの配列に含まれる関数をFunctionSetに追加します。
- `remove(func: FuncAny)`: FunctionSetから関数を削除します。
- `get(name: string)`: 指定した名前の関数を取得します。
- `list()`: FunctionSetに含まれるすべての関数を配列として返します。
- `names()`: FunctionSetに含まれるすべての関数の名前を配列として返します。
- `asObjectList()`: FunctionSetに含まれるすべての関数をオブジェクトの配列として返します。
- `asTypeScript()`: FunctionSetに含まれるすべての関数をTypeScriptの形式で返します。
- `has(name: string)`: 指定した名前の関数がFunctionSetに含まれているかどうかを返します。
- `length()`: FunctionSetに含まれる関数の数を返します。
- `isEmpty()`: FunctionSetが空かどうかを返します。
- `call(name: string, arg: string)`: 指定した名前の関数を呼び出します。
- `semantics()`: FunctionSetに含まれるすべての関数の名前と説明を配列として返します。
- `search(query: string, topK: number)`: FunctionSetに含まれる関数を検索します。
- `create(options: FuncAny[] | FunctionSet | undefined)`: 新しいFunctionSetを作成します。

## タイプ: FunctionSetOption

- `functions?: FunctionSet | FuncAny[]`: FunctionSetまたはFuncAnyの配列をオプションとして持つことができます。