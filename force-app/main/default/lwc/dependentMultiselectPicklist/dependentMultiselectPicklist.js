import { LightningElement, track, api, wire } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';
import getCaseDetails from '@salesforce/apex/CaseController.getCaseDetails';
import CASE_OBJECT from '@salesforce/schema/Case';
import FIELD_REASON from '@salesforce/schema/Case.Reason';
import FIELD_CASE_REASON_DETAIL from '@salesforce/schema/Case.Case_Reason_Detail__c';

export default class DependentMultiselectPicklist extends LightningElement {
    @api recordId; // Case record ID
    @api recordTypeId = '0126Q0000005RQ4QAM'; // Hardcoded Record Type ID (Replace with actual)

    @track reasonOptions = [];
    @track dependentOptions = {};
    @track caseReasonDetails = [];

    @api selectedReason;
    @api selectedCaseReasonDetails = [];

    // Lifecycle Hook
    connectedCallback() {
        // Delay fetching case record to ensure picklist values are loaded first
        setTimeout(() => {
            this.fetchCaseRecord();
        }, 500);
    }

    // Fetch Case record details to prepopulate picklist values
    async fetchCaseRecord() {
        if (!this.recordId) {
            console.error('Record Id is undefined');
            return;
        }

        try {
            const caseRecord = await getCaseDetails({ recordId: this.recordId });

            console.log('Fetched Case Record:', JSON.stringify(caseRecord, null, 2));

            if (caseRecord) {
                this.selectedReason = caseRecord.Reason || '';
                console.log('this.selectedReason--->', this.selectedReason);

                if (this.selectedReason) {
                    this.caseReasonDetails = this.dependentOptions[this.selectedReason] || [];

                    let storedValues = caseRecord.Case_Reason_Detail__c || '';
                    let tempArr = storedValues ? storedValues.split(';') : [];

                    // Ensure selectedCaseReasonDetails contains only values (not objects)
                    this.selectedCaseReasonDetails = tempArr.map(item => item.trim());

                    console.log('this.selectedCaseReasonDetails--->', this.selectedCaseReasonDetails);
                }
            }
        } catch (error) {
            console.error('Error fetching Case record:', error);
        }
    }

    // Fetch picklist values for Case object based on Record Type
    @wire(getPicklistValuesByRecordType, { objectApiName: CASE_OBJECT, recordTypeId: '$recordTypeId' })
    wiredPicklistValues({ data, error }) {
        if (data) {
            // Populate parent picklist (Reason)
            this.reasonOptions = data.picklistFieldValues[FIELD_REASON.fieldApiName].values.map(item => ({
                label: item.label, value: item.value
            }));

            // Populate dependent multi-select picklist (Case_Reason_Detail__c)
            let controllerValues = data.picklistFieldValues[FIELD_CASE_REASON_DETAIL.fieldApiName].controllerValues;
            let values = data.picklistFieldValues[FIELD_CASE_REASON_DETAIL.fieldApiName].values;

            values.forEach(item => {
                let key = Object.keys(controllerValues).find(k => controllerValues[k] === item.validFor[0]);
                if (!this.dependentOptions[key]) {
                    this.dependentOptions[key] = [];
                }
                this.dependentOptions[key].push({ label: item.label, value: item.value });
            });
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }

    // Handle Parent Picklist Change
    handleReasonChange(event) {
        console.log('inside handleReasonChange---->');
        const newReason = event.detail.value;

        // Only reset values if the user changes the reason manually
        if (this.selectedReason !== newReason) {
            this.selectedReason = newReason;
            this.selectedCaseReasonDetails = [];
        }

        this.caseReasonDetails = this.dependentOptions[this.selectedReason] || [];

        // Dispatch event to update Flow variable
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: { reason: this.selectedReason, caseReasonDetails: this.selectedCaseReasonDetails }
        }));
    }

    // Handle Dependent Multi-Select Picklist Change
    handleCaseReasonDetailChange(event) {
        console.log('inside handleCaseReasonDetailChange---->');
        this.selectedCaseReasonDetails = event.detail.value; // This is an array of selected values

        // Dispatch event to Flow, joining values with ";"
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: { 
                reason: this.selectedReason, 
                caseReasonDetails: this.selectedCaseReasonDetails.join(';') // Convert array to string
            }
        }));
    }
}
