import frecent from "../src/index";

describe("Frecent", function() {
  beforeEach(() => {
    this.frecent = frecent();
  });

  it("should load items", () => {
    this.frecent.load([
      { url: "https://example.com" },
      { url: "https://example.org" }
    ]);

    expect(this.frecent.items.length).toBe(2);
    expect(this.frecent.items[0].meta).toBeDefined();
  });

  it("should load formatted items", () => {
    const items = [
      {
        data: { url: "https://example.com" },
        meta: {
          visits: 2,
          lastVisit: new Date(2017, 11, 10),
          weight: 100
        }
      }
    ];

    this.frecent.load(items);

    expect(this.frecent.items).toEqual(items);
  });

  it("should compute frecency", () => {
    const items = [
      { url: "https://example.com" },
      { url: "https://example.org" }
    ];

    this.frecent
      .load(items)
      .visit(item => item.url === "https://example.com")
      .visit(item => item.url === "https://example.com")
      .visit(item => item.url === "https://example.org")
      .visit(item => item.url === "https://example.org")
      .visit(item => item.url === "https://example.org");

    expect(this.frecent.get()[0].data).toEqual(items[1]);
  });
});
