export default interface AccountRecordQueryCondition {
    startDate?: Date;
    endDate?: Date;
    recordType?: string;
    accountId?: string;
    desc?: string;
}