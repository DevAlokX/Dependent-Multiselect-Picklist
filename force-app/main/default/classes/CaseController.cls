public with sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static Case getCaseDetails(Id recordId) {
        try {
            return [SELECT Id, Reason, Case_Reason_Detail__c FROM Case WHERE Id = :recordId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Case record: ' + e.getMessage());
        }
    }
	@InvocableMethod
    public static List<String> joinValues(List<List<String>> inputLists) {
        List<String> result = new List<String>();
        if (!inputLists.isEmpty()) {
            result.add(String.join(inputLists[0], ';'));
        }
        return result;
    }
}
