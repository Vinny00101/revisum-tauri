export default abstract class BaseEntity {
  protected constructor(
    public readonly id: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}