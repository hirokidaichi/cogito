import { cogito, z } from "../cogito/mod.ts";

const thinkers = [
  {
    name: "getProductList",
    description: "商品のリストを取得する関数",
    input: z.object({}),
    output: z.object({ id: z.number(), name: z.string(), price: z.number() }),
  },
  {
    name: "fetchUserNames",
    description:
      "指定されたユーザーIDのリストから、それぞれのユーザー名を取得します。",
    input: z.array(z.string()),
    output: z.array(z.string()),
  },
  {
    name: "retrieveOrderHistory",
    description: "指定されたユーザーの注文履歴を取得する",
    input: z.string().nonempty(),
    output: z.array(z.object({ orderId: z.string(), date: z.string() })),
  },
  {
    name: "listAllEmployees",
    description: "全ての従業員をリストアップする関数",
    input: z.object({}),
    output: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        position: z.string(),
        department: z.string(),
      }),
    ),
  },
  {
    name: "enumerateInventoryItems",
    description: "在庫アイテムを列挙する関数",
    input: z.object({
      inventory: z.array(z.object({ id: z.string(), quantity: z.number() })),
    }),
    output: z.array(z.object({ id: z.string(), quantity: z.number() })),
  },
  {
    name: "showAvailableCourses",
    description: "利用可能なコースの一覧を表示する",
    input: z.string().optional(),
    output: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        available: z.boolean(),
      }),
    ),
  },
  {
    name: "displayCustomerDetails",
    description: "指定された顧客の詳細情報を表示する",
    input: z.string().nonempty("顧客IDは必須です"),
    output: z.object({
      name: z.string(),
      age: z.number(),
      address: z.string(),
    }),
  },
  {
    name: "generateReportList",
    description: "指定されたパラメータに基づいてレポートのリストを生成する関数",
    input: z.object({ parameters: z.array(z.string()) }),
    output: z.array(
      z.object({
        reportId: z.string(),
        reportName: z.string(),
        reportDate: z.string(),
      }),
    ),
  },
  {
    name: "compileTaskList",
    description:
      "与えられたタスクリストをコンパイルし、優先度や期限に基づいて整理します。",
    input: z.array(
      z.object({
        task: z.string(),
        priority: z.number(),
        deadline: z.string(),
      }),
    ),
    output: z.array(
      z.object({
        task: z.string(),
        priority: z.number(),
        deadline: z.string(),
      }),
    ),
  },
  {
    name: "extractEmailAddresses",
    description: "与えられたテキストからメールアドレスを抽出する関数",
    input: z.string(),
    output: z.array(z.string()),
  },
  {
    name: "pullRecentTransactions",
    description: "指定されたユーザーの最近の取引履歴を取得する",
    input: z.string().nonempty(),
    output: z.array(
      z.object({
        transactionId: z.string(),
        amount: z.number(),
        date: z.string(),
      }),
    ),
  },
  {
    name: "queryDatabaseRecords",
    description: "指定されたクエリを使用してデータベースのレコードを検索する",
    input: z.string().nonempty(),
    output: z.array(z.object({ id: z.number(), data: z.any() })),
  },
  {
    name: "presentSurveyResults",
    description: "アンケートの結果を提示する関数",
    input: z.array(z.object({ question: z.string(), answer: z.string() })),
    output: z.object({
      result: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
          count: z.number(),
        }),
      ),
    }),
  },
  {
    name: "collectFeedbackResponses",
    description: "ユーザーからのフィードバックのレスポンスを収集する",
    input: z.string().nonempty(),
    output: z.array(z.object({ feedback: z.string() })),
  },
  {
    name: "enumerateUserSessions",
    description: "指定されたユーザーのすべてのセッションを列挙します",
    input: z.string().nonempty(),
    output: z.array(
      z.object({
        sessionId: z.string(),
        startTime: z.date(),
        endTime: z.date().optional(),
      }),
    ),
  },
  {
    name: "listActiveSubscriptions",
    description: "アクティブなサブスクリプションのリストを取得する",
    input: z.object({}),
    output: z.array(
      z.object({ id: z.string(), name: z.string(), isActive: z.boolean() }),
    ),
  },
  {
    name: "fetchOrderStatuses",
    description: "指定された注文IDのステータスを取得する",
    input: z.string().nonempty(),
    output: z.object({ status: z.string() }),
  },
  {
    name: "retrieveDocumentTitles",
    description:
      "指定されたドキュメントIDのリストから、それぞれのドキュメントのタイトルを取得する",
    input: z.array(z.string()),
    output: z.array(z.string()),
  },
  {
    name: "showCompletedTasks",
    description: "完了したタスクを表示する関数",
    input: z.array(z.object({ task: z.string(), completed: z.boolean() })),
    output: z.array(z.object({ task: z.string(), completed: z.literal(true) })),
  },
  {
    name: "listPendingApprovals",
    description: "保留中の承認リクエストのリストを生成します",
    input: z.string().optional(),
    output: z.array(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
      }),
    ),
  },
].map((def) =>
  cogito.thinker(def.name, {
    description: def.description,
    input: def.input,
    // deno-lint-ignore no-explicit-any
    output: def.output as any,
  })
);

const fs = cogito.functionset(thinkers);

const exThinker = cogito.thinker("summarySurvey", {
  description: "アンケート結果をサマリーして表示",
  input: z.void(),
  output: z.string(),
  functions: fs.search("アンケートの表示", 2),
});

console.log(await exThinker.call());
