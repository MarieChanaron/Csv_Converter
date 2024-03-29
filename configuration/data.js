// This single column corresponds to 3 columns in the final table:
// Action / Data / Result
const TEST_STEPS_HEADER = 'Custom field (Manual Test Steps)'

const TCID_HEADER = 'TCID';
const ACTION_HEADER = 'Action';
const DATA_HEADER = 'Data';
const RESULT_HEADER = 'Result';

const ACTION_JSON_PROPERTY = 'Action';
const DATA_JSON_PROPERTY = 'Data';
const RESULT_JSON_PROPERTY = 'Expected Result';

/*
Matching between the input file and the output file.
On the left (key): output file
On the right (value): input file
Configure here the order of columns of the final file, and the correspondance between columns between the file of origin and final file
*/
const HEADERS = {
    "Issue Key": "Issue key",
    "Type": "Issue Type",
    "Test Type": "Custom field (Test Type)",
    "Status": "Status",
    "TCID": undefined,
    "Summary": "Summary",
    "Description": "Description",
    "Action": undefined,
    "Data": undefined,
    "Result": undefined,
    "Priority": "Priority",
    "Components": "Component/s",
    "Test Repository Path": "Custom field (Test Repository Path)",
    "Link \"Tests\"": "Outward issue link (Tests)",
    "Link \"Defect\"": "Outward issue link (Defect)",
    "Link \"Blocks\"": "Outward issue link (Blocks)",
    "Link \"Relates\"": "Outward issue link (Relates)",
    "Link \"Cloners\"": "Outward issue link (Cloners)",
    "Reporter": "Reporter",
    "Assignee": "Assignee",
    "Label": "Labels",
    "Custom field (Test Level)": "Custom field (Test Level)",
    "Custom field (Steps Count)": "Custom field (Steps Count)",
    "Environment": "Environment",
    "Created": "Created"
}