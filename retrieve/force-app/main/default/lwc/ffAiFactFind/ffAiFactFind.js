import { LightningElement, api, track } from 'lwc';
import { loadStyle }               from 'lightning/platformResourceLoader';
import FF_FONTS                    from '@salesforce/resourceUrl/ffFonts';
import getInteractionSummary  from '@salesforce/apex/FF_FactFindController.getInteractionSummary';
import extractAIData           from '@salesforce/apex/FF_FactFindController.extractAIData';
import getCurrentAccountData   from '@salesforce/apex/FF_FactFindController.getCurrentAccountData';
import saveFactFind            from '@salesforce/apex/FF_FactFindController.saveFactFind';

// ── Confidence mapping ───────────────────────────────────────────────────────
const CONF_PCT = { HIGH: 95, LOW: 40, UNCERTAIN: 20, NOT_MENTIONED: 0 };

const CONF_LABEL = {
    HIGH:          '◆',
    LOW:           '◆',
    UNCERTAIN:     '◆',
    NOT_MENTIONED: '◆'
};

// ── Picklist options (values confirmed from dev26 Salesforce org) ────────────
const PICKLIST_OPTIONS = {
    GENDER:           ['Male','Female','Non-binary','Other','Not Stated'],
    MARITAL_STATUS:   ['Single','Married/Civil Partner','Divorced','Widowed/Surviving Civil Partner','Separated','Other','Not Disclosed'],
    COMMS_PREF:       ['Phone','Email','Mobile'],
    EMP_STATUS:       ['Employed Full-Time','Employed Part-Time','Self-Employed','Unemployed','Student','Retired','Other'],
    RISK_TOLERANCE:   ['Very High','High','Medium','Low','Very Low'],
    CAPACITY_FOR_LOSS:['Very High','High','Medium','Low','Very Low'],
    ENVIRONMENTAL:    ['Yes','No','No Preference','Unknown'],
    SOCIAL:           ['Yes','No','No Preference','Unknown'],
    YES_NO:           ['Yes','No'],
    ASSET_TYPE:       ['Real Estate','Vehicle','Equipment','Collection','Gold','Jewellery','Cash','Other'],
    GOAL_TYPE:        ['Education','Emergency','Home','Pay off Debt','Retirement','Vacation','Vehicle','Other'],
    GOAL_PRIORITY:    ['LOW','MEDIUM','HIGH'],
    LIABILITY_TYPE:   ['Mortgage','Credit Card','Bank Overdraft','Vehicle Finance','Other Loans','Life Assurance','Private Health Care','Other']
};

// ── Static field definitions ─────────────────────────────────────────────────
// key         → DATA_START block key
// label       → display name
// sfField     → Account API field name (for current value lookup)
// tab         → tab id
// inputType   → text / date / number / select / textarea
// optionsKey  → key into PICKLIST_OPTIONS (for select fields only)
// groupLabel  → optional group heading (Goals / Assets / Liabilities)
const FIELD_DEFS = [
    // Personal
    { key:'BIRTHDATE',      label:'Date of Birth',           sfField:'PersonBirthdate',                  tab:'personal',    inputType:'date'   },
    { key:'GENDER',         label:'Gender',                  sfField:'FF_Gender__c',                     tab:'personal',    inputType:'select',   optionsKey:'GENDER'           },
    { key:'MARITAL_STATUS', label:'Marital Status',          sfField:'FF_Marital_Status__c',             tab:'personal',    inputType:'select',   optionsKey:'MARITAL_STATUS'   },
    { key:'NUM_DEPENDENTS', label:'No. of Dependents',       sfField:'FF_Number_of_Dependents__c',       tab:'personal',    inputType:'number' },
    { key:'MAILING_STREET', label:'Street',                   sfField:'BillingStreet',                    tab:'personal',    inputType:'textarea' },
    { key:'MAILING_CITY',   label:'City',                    sfField:'BillingCity',                      tab:'personal',    inputType:'text'   },
    { key:'MAILING_POSTCODE',label:'Postcode',               sfField:'BillingPostalCode',                tab:'personal',    inputType:'text'   },
    { key:'MAILING_COUNTRY',label:'Country',                 sfField:'BillingCountry',                   tab:'personal',    inputType:'text'   },
    { key:'PHONE',          label:'Phone',                   sfField:'PersonHomePhone',                  tab:'personal',    inputType:'text'   },
    { key:'MOBILE',         label:'Mobile',                  sfField:'PersonMobilePhone',                tab:'personal',    inputType:'text'   },
    { key:'EMAIL',          label:'Email',                   sfField:'PersonEmail',                      tab:'personal',    inputType:'text'   },
    { key:'COMMS_PREF',     label:'Communication Preference',sfField:'FF_Communication_Preferences__c', tab:'personal',    inputType:'select',   optionsKey:'COMMS_PREF'       },

    // Employment
    { key:'EMP_STATUS',     label:'Employment Status',       sfField:'FF_Employment_Status__c',          tab:'employment',  inputType:'select',   optionsKey:'EMP_STATUS'       },
    { key:'EMPLOYER_NAME',  label:'Employer',                sfField:'FF_Employer_Name__c',              tab:'employment',  inputType:'text'   },
    { key:'OCCUPATION',     label:'Occupation',              sfField:'FF_Occupation__c',                 tab:'employment',  inputType:'text'   },
    { key:'DATE_EMPLOYED',  label:'Date Employment Started', sfField:'FF_Date_Employment_Commenced__c',  tab:'employment',  inputType:'date'   },
    { key:'ANNUAL_INCOME',  label:'Annual Income (£)',       sfField:'FF_Annual_Income__c',              tab:'employment',  inputType:'number' },
    { key:'ANNUAL_BONUS',   label:'Annual Bonus (£)',        sfField:'FF_Annual_Bonus__c',               tab:'employment',  inputType:'number' },
    { key:'OTHER_INCOME',   label:'Other Income (£)',        sfField:'FF_Other_Income__c',               tab:'employment',  inputType:'number' },
    { key:'OTHER_INCOME_SRC',label:'Other Income Source',   sfField:'FF_Other_Income_Source__c',        tab:'employment',  inputType:'text'   },
    { key:'RETIREMENT_AGE', label:'Intended Retirement Age', sfField:'FF_Intended_Retirement_Age__c',   tab:'employment',  inputType:'number' },

    // Goals — Group 1
    { key:'G1_NAME',     label:'Name',        sfField:null, tab:'goals', inputType:'textarea', groupLabel:'Goal 1' },
    { key:'G1_TYPE',     label:'Type',        sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_TYPE'     },
    { key:'G1_AMOUNT',   label:'Target (£)',  sfField:null, tab:'goals', inputType:'number'  },
    { key:'G1_DATE',     label:'Target Date', sfField:null, tab:'goals', inputType:'date'    },
    { key:'G1_PRIORITY', label:'Priority',    sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_PRIORITY' },
    { key:'G1_DESC',     label:'Description', sfField:null, tab:'goals', inputType:'textarea' },
    // Goals — Group 2
    { key:'G2_NAME',     label:'Name',        sfField:null, tab:'goals', inputType:'textarea', groupLabel:'Goal 2' },
    { key:'G2_TYPE',     label:'Type',        sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_TYPE'     },
    { key:'G2_AMOUNT',   label:'Target (£)',  sfField:null, tab:'goals', inputType:'number'  },
    { key:'G2_DATE',     label:'Target Date', sfField:null, tab:'goals', inputType:'date'    },
    { key:'G2_PRIORITY', label:'Priority',    sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_PRIORITY' },
    { key:'G2_DESC',     label:'Description', sfField:null, tab:'goals', inputType:'textarea' },
    // Goals — Group 3
    { key:'G3_NAME',     label:'Name',        sfField:null, tab:'goals', inputType:'textarea', groupLabel:'Goal 3' },
    { key:'G3_TYPE',     label:'Type',        sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_TYPE'     },
    { key:'G3_AMOUNT',   label:'Target (£)',  sfField:null, tab:'goals', inputType:'number'  },
    { key:'G3_DATE',     label:'Target Date', sfField:null, tab:'goals', inputType:'date'    },
    { key:'G3_PRIORITY', label:'Priority',    sfField:null, tab:'goals', inputType:'select',   optionsKey:'GOAL_PRIORITY' },
    { key:'G3_DESC',     label:'Description', sfField:null, tab:'goals', inputType:'textarea' },

    // Assets — Groups 1–5
    { key:'A1_NAME',  label:'Name',        sfField:null, tab:'assets', inputType:'textarea', groupLabel:'Asset 1' },
    { key:'A1_TYPE',  label:'Type',        sfField:null, tab:'assets', inputType:'select',   optionsKey:'ASSET_TYPE' },
    { key:'A1_VALUE', label:'Value (£)',   sfField:null, tab:'assets', inputType:'number'  },
    { key:'A1_DESC',  label:'Description', sfField:null, tab:'assets', inputType:'textarea' },
    { key:'A2_NAME',  label:'Name',        sfField:null, tab:'assets', inputType:'textarea', groupLabel:'Asset 2' },
    { key:'A2_TYPE',  label:'Type',        sfField:null, tab:'assets', inputType:'select',   optionsKey:'ASSET_TYPE' },
    { key:'A2_VALUE', label:'Value (£)',   sfField:null, tab:'assets', inputType:'number'  },
    { key:'A2_DESC',  label:'Description', sfField:null, tab:'assets', inputType:'textarea' },
    { key:'A3_NAME',  label:'Name',        sfField:null, tab:'assets', inputType:'textarea', groupLabel:'Asset 3' },
    { key:'A3_TYPE',  label:'Type',        sfField:null, tab:'assets', inputType:'select',   optionsKey:'ASSET_TYPE' },
    { key:'A3_VALUE', label:'Value (£)',   sfField:null, tab:'assets', inputType:'number'  },
    { key:'A3_DESC',  label:'Description', sfField:null, tab:'assets', inputType:'textarea' },
    { key:'A4_NAME',  label:'Name',        sfField:null, tab:'assets', inputType:'textarea', groupLabel:'Asset 4' },
    { key:'A4_TYPE',  label:'Type',        sfField:null, tab:'assets', inputType:'select',   optionsKey:'ASSET_TYPE' },
    { key:'A4_VALUE', label:'Value (£)',   sfField:null, tab:'assets', inputType:'number'  },
    { key:'A4_DESC',  label:'Description', sfField:null, tab:'assets', inputType:'textarea' },
    { key:'A5_NAME',  label:'Name',        sfField:null, tab:'assets', inputType:'textarea', groupLabel:'Asset 5' },
    { key:'A5_TYPE',  label:'Type',        sfField:null, tab:'assets', inputType:'select',   optionsKey:'ASSET_TYPE' },
    { key:'A5_VALUE', label:'Value (£)',   sfField:null, tab:'assets', inputType:'number'  },
    { key:'A5_DESC',  label:'Description', sfField:null, tab:'assets', inputType:'textarea' },

    // Liabilities — Groups 1–5
    { key:'L1_NAME',    label:'Name',             sfField:null, tab:'liabilities', inputType:'textarea', groupLabel:'Liability 1' },
    { key:'L1_TYPE',    label:'Type',             sfField:null, tab:'liabilities', inputType:'select',   optionsKey:'LIABILITY_TYPE' },
    { key:'L1_BALANCE', label:'Balance (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L1_LENDER',  label:'Lender',           sfField:null, tab:'liabilities', inputType:'text'    },
    { key:'L1_RATE',    label:'Interest Rate (%)', sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L1_PAYMENT', label:'Monthly (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L2_NAME',    label:'Name',             sfField:null, tab:'liabilities', inputType:'textarea', groupLabel:'Liability 2' },
    { key:'L2_TYPE',    label:'Type',             sfField:null, tab:'liabilities', inputType:'select',   optionsKey:'LIABILITY_TYPE' },
    { key:'L2_BALANCE', label:'Balance (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L2_LENDER',  label:'Lender',           sfField:null, tab:'liabilities', inputType:'text'    },
    { key:'L2_RATE',    label:'Interest Rate (%)', sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L2_PAYMENT', label:'Monthly (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L3_NAME',    label:'Name',             sfField:null, tab:'liabilities', inputType:'textarea', groupLabel:'Liability 3' },
    { key:'L3_TYPE',    label:'Type',             sfField:null, tab:'liabilities', inputType:'select',   optionsKey:'LIABILITY_TYPE' },
    { key:'L3_BALANCE', label:'Balance (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L3_LENDER',  label:'Lender',           sfField:null, tab:'liabilities', inputType:'text'    },
    { key:'L3_RATE',    label:'Interest Rate (%)', sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L3_PAYMENT', label:'Monthly (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L4_NAME',    label:'Name',             sfField:null, tab:'liabilities', inputType:'textarea', groupLabel:'Liability 4' },
    { key:'L4_TYPE',    label:'Type',             sfField:null, tab:'liabilities', inputType:'select',   optionsKey:'LIABILITY_TYPE' },
    { key:'L4_BALANCE', label:'Balance (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L4_LENDER',  label:'Lender',           sfField:null, tab:'liabilities', inputType:'text'    },
    { key:'L4_RATE',    label:'Interest Rate (%)', sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L4_PAYMENT', label:'Monthly (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L5_NAME',    label:'Name',             sfField:null, tab:'liabilities', inputType:'textarea', groupLabel:'Liability 5' },
    { key:'L5_TYPE',    label:'Type',             sfField:null, tab:'liabilities', inputType:'select',   optionsKey:'LIABILITY_TYPE' },
    { key:'L5_BALANCE', label:'Balance (£)',       sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L5_LENDER',  label:'Lender',           sfField:null, tab:'liabilities', inputType:'text'    },
    { key:'L5_RATE',    label:'Interest Rate (%)', sfField:null, tab:'liabilities', inputType:'number'  },
    { key:'L5_PAYMENT', label:'Monthly (£)',       sfField:null, tab:'liabilities', inputType:'number'  },

    // Risk & Profile
    { key:'RISK_TOLERANCE',   label:'Risk Tolerance',      sfField:'FF_Risk_Tolerance__c',              tab:'risk', inputType:'select', optionsKey:'RISK_TOLERANCE'    },
    { key:'CAPACITY_FOR_LOSS',label:'Capacity for Loss',   sfField:'FF_Capacity_For_Loss__c',           tab:'risk', inputType:'select', optionsKey:'CAPACITY_FOR_LOSS' },
    { key:'NI_NUMBER',        label:'NI Number',           sfField:'FF_Uk_National_Insurance_Number__c',tab:'risk', inputType:'text'   },
    { key:'TAX_ID',           label:'Tax ID',              sfField:'FF_Tax_Identification_Number__c',   tab:'risk', inputType:'text'   },
    { key:'ENVIRONMENTAL',    label:'Environmental (ESG)', sfField:'FF_Environmental__c',               tab:'risk', inputType:'select', optionsKey:'ENVIRONMENTAL'     },
    { key:'SOCIAL',           label:'Social (ESG)',        sfField:'FF_Social__c',                      tab:'risk', inputType:'select', optionsKey:'SOCIAL'            },

    // Estate & Vulnerability
    { key:'WILL_IN_PLACE', label:'Will in Place',            sfField:'FF_Will__c',                      tab:'estate', inputType:'select',   optionsKey:'YES_NO' },
    { key:'LPA_IN_PLACE',  label:'LPA in Place',             sfField:'FF_Lasting_Power_Of_Attorney__c', tab:'estate', inputType:'select',   optionsKey:'YES_NO' },
    { key:'LPA_DETAILS',   label:'LPA Details',              sfField:'FF_Power_Of_Attorney_Details__c', tab:'estate', inputType:'textarea' },
    { key:'VULN_DETECTED', label:'Vulnerability Detected',   sfField:null,                              tab:'estate', inputType:'select',   optionsKey:'YES_NO' },
    { key:'VULN_DESC',     label:'Vulnerability Description', sfField:null,                             tab:'estate', inputType:'textarea' },
    { key:'VULN_DURATION', label:'Vulnerability Duration',   sfField:null,                              tab:'estate', inputType:'text'     }
];

const TAB_META = [
    { id:'personal',     label:'Personal'             },
    { id:'employment',   label:'Employment & Income'  },
    { id:'goals',        label:'Goals'                },
    { id:'assets',       label:'Assets'               },
    { id:'liabilities',  label:'Liabilities'          },
    { id:'risk',         label:'Risk & Profile'       },
    { id:'estate',       label:'Estate & Vulnerability'}
];

export default class FfAiFactFind extends LightningElement {
    @api recordId;

    // — state —
    @track accountName      = '';
    @track interactionDate  = '';
    @track isLoading        = false;
    @track isSubmitting     = false;
    @track hasAiData        = false;
    @track showEmptyState   = true;
    @track noMeetingNotes   = false;
    @track errorMessage     = '';
    @track successMessage   = '';
    @track activeTab        = 'personal';

    // — field state (flat map: key → field object) —
    @track fieldMap = {};

    // — narrative —
    @track narrativeEditValue = '';

    // — IS record id —
    interactionSummaryId = null;

    // — submitted success screen —
    @track submittedSummary = null;

    // ── Lifecycle ───────────────────────────────────────────────────────────────

    connectedCallback() {
        this._loadFonts();
        this._restoreSubmittedState();
        this._loadAccountName();
    }

    _loadFonts() {
        loadStyle(this, FF_FONTS + '/fonts.css').catch(() => {
            // Font load failed silently — UI falls back to Georgia / system-sans
        });
    }

    // ── Submitted-state persistence (localStorage) ───────────────────────────

    _storageKey() {
        return `ff_factfind_submitted_${this.recordId}`;
    }

    _restoreSubmittedState() {
        try {
            const raw = localStorage.getItem(this._storageKey());
            if (raw) {
                this.submittedSummary = JSON.parse(raw);
            }
        } catch (e) {
            // localStorage unavailable or parse error — silently ignore
        }
    }

    _persistSubmittedState(summary) {
        try {
            localStorage.setItem(this._storageKey(), JSON.stringify(summary));
        } catch (e) {
            // Quota exceeded or unavailable — silently ignore
        }
    }

    _clearSubmittedState() {
        try {
            localStorage.removeItem(this._storageKey());
        } catch (e) {
            // silently ignore
        }
    }

    async _loadAccountName() {
        try {
            const data = await getCurrentAccountData({ accountId: this.recordId });
            this.accountName = data.AccountName || '';
            // Pre-populate fieldMap with current Salesforce values
            this._applyCurrentValues(data);
        } catch (e) {
            // Non-fatal — component still usable
            this.accountName = '';
        }
    }

    // ── Run AI ──────────────────────────────────────────────────────────────────

    async handleRunAI() {
        this.clearMessages();
        this.isLoading      = true;
        this.showEmptyState = false;

        try {
            // 1. Find latest IS with MeetingNotes
            const isInfo = await getInteractionSummary({ accountId: this.recordId });
            if (!isInfo.hasMeetingNotes) {
                this.noMeetingNotes   = true;
                this.showEmptyState   = true;
                this.isLoading        = false;
                this.errorMessage     = 'No meeting transcript found. Please add Meeting Notes to an Interaction Summary record first.';
                return;
            }
            this.interactionSummaryId = isInfo.isRecordId;
            this.interactionDate      = isInfo.meetingDate
                ? new Date(isInfo.meetingDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
                : '';

            // 2. Call AI
            const rawText = await extractAIData({ isRecordId: isInfo.isRecordId });

            // 3. Fetch current Account values (fresh)
            const currentData = await getCurrentAccountData({ accountId: this.recordId });

            // 4. Parse AI response
            const { dataBlock, confidences, narrative } = this._parseAIResponse(rawText);

            // 5. Narrative
            this.narrativeEditValue = narrative || '';

            // 6. Build field state
            this._buildFieldMap(dataBlock, confidences, currentData);

            this.hasAiData        = true;
            this.showEmptyState   = false;
            this.activeTab        = 'personal';

        } catch (e) {
            this.errorMessage   = 'AI extraction failed: ' + (e.body?.message || e.message || String(e));
            this.showEmptyState = !this.hasAiData;
        } finally {
            this.isLoading = false;
        }
    }

    // ── AI Parsing ──────────────────────────────────────────────────────────────

    /**
     * Extract values from the <<<DATA_START>>> … <<<DATA_END>>> block.
     * Returns { dataBlock: {KEY: 'value', …}, confidences: {KEY: 'HIGH'|'LOW'|…} }
     */
    _parseAIResponse(text) {
        const dataBlock    = {};
        const confidences  = {};

        // ── DATA_START block ──
        const blockMatch = text.match(/<<<DATA_START>>>([\s\S]*?)<<<DATA_END>>>/);
        if (blockMatch) {
            const lines = blockMatch[1].split('\n');
            for (const line of lines) {
                const eqIdx = line.indexOf('=');
                if (eqIdx === -1) continue;
                const key = line.substring(0, eqIdx).trim();
                let val = line.substring(eqIdx + 1).trim();

                // Strip trailing confidence marker: ~ HIGH/LOW/UNCERTAIN/NOT_MENTIONED
                // Use end-of-line match so we don't truncate narrative text that contains ~
                const confMarker = val.match(/~\s*(HIGH|LOW|UNCERTAIN|NOT_MENTIONED)\s*$/i);
                if (confMarker) {
                    val = val.substring(0, val.length - confMarker[0].length).trim();
                    // Also capture confidence for this key
                    if (key && !confidences[key]) {
                        confidences[key] = confMarker[1].toUpperCase();
                    }
                } else {
                    // Fallback: strip at first ~ only if no value content after it matters
                    const tildeIdx = val.indexOf('~');
                    if (tildeIdx !== -1) val = val.substring(0, tildeIdx).trim();
                }

                // Strip surrounding brackets if present [value]
                if (val.startsWith('[') && val.endsWith(']')) {
                    val = val.slice(1, -1).trim();
                }

                if (key) dataBlock[key] = val;
            }
        }

        // ── Confidence from TASK 1 section ──
        // Each field line: FIELD_NAME: value | CONFIDENCE
        const task1Match = text.match(/## TASK 1[\s\S]*?(?=## TASK 2|---)/);
        if (task1Match) {
            const task1Lines = task1Match[0].split('\n');
            for (const line of task1Lines) {
                const pipeIdx = line.lastIndexOf('|');
                if (pipeIdx === -1) continue;
                const colonIdx = line.indexOf(':');
                if (colonIdx === -1 || colonIdx > pipeIdx) continue;
                const rawKey = line.substring(0, colonIdx).trim().toUpperCase();
                const confRaw = line.substring(pipeIdx + 1).trim().toUpperCase();
                // Map TASK 1 keys to DATA_START keys
                const mappedKey = this._task1KeyToDataKey(rawKey);
                if (mappedKey && (confRaw === 'HIGH' || confRaw === 'LOW' ||
                    confRaw === 'UNCERTAIN' || confRaw === 'NOT_MENTIONED')) {
                    confidences[mappedKey] = confRaw;
                }
            }
        }

        // For GOAL/ASSET/LIABILITY lines, extract confidence from inline structured lines
        // GOAL: name=[…] | … | confidence=[HIGH/LOW/UNCERTAIN]
        const goalLines = text.match(/^GOAL:.*$/gm) || [];
        goalLines.forEach((line, i) => {
            const gNum = i + 1;
            const conf = this._extractInlineConf(line);
            if (conf !== null) {
                ['G'+gNum+'_NAME','G'+gNum+'_TYPE','G'+gNum+'_AMOUNT',
                 'G'+gNum+'_DATE','G'+gNum+'_PRIORITY','G'+gNum+'_DESC'].forEach(k => {
                    if (!confidences[k]) confidences[k] = conf;
                });
            }
        });

        const assetLines = text.match(/^ASSET:.*$/gm) || [];
        assetLines.forEach((line, i) => {
            const aNum = i + 1;
            const conf = this._extractInlineConf(line);
            // Extract type from inline format: type=[Real Estate]
            // DATA_START doesn't include asset type, so we parse it from TASK 1 here
            const typeMatch = line.match(/type=\[([^\]]+)\]/i);
            if (typeMatch && !dataBlock[`A${aNum}_TYPE`]) {
                dataBlock[`A${aNum}_TYPE`] = typeMatch[1].trim();
            }
            if (conf !== null) {
                ['A'+aNum+'_NAME','A'+aNum+'_TYPE','A'+aNum+'_VALUE','A'+aNum+'_DESC'].forEach(k => {
                    if (!confidences[k]) confidences[k] = conf;
                });
            }
        });

        const liabLines = text.match(/^LIABILITY:.*$/gm) || [];
        liabLines.forEach((line, i) => {
            const lNum = i + 1;
            const conf = this._extractInlineConf(line);
            if (conf !== null) {
                ['L'+lNum+'_NAME','L'+lNum+'_TYPE','L'+lNum+'_BALANCE',
                 'L'+lNum+'_LENDER','L'+lNum+'_RATE','L'+lNum+'_PAYMENT'].forEach(k => {
                    if (!confidences[k]) confidences[k] = conf;
                });
            }
        });

        // ── Narrative extraction ──
        // Priority 1: NARRATIVE key already parsed from DATA_START block
        let narrative = dataBlock['NARRATIVE'] || '';

        // Priority 2: any TASK 2 / Advisor Narrative section header (flexible format)
        if (!narrative) {
            const task2Match = text.match(
                /(?:##\s*TASK\s*2|TASK\s*2\s*[-:–]|Advisor\s*Narrative\s*:?)[^\n]*\n+([\s\S]*?)(?=\n##\s*TASK|\n---\s*\n|<<<DATA_START|$)/i
            );
            if (task2Match) {
                narrative = task2Match[1]
                    .replace(/^\[/, '').replace(/\]$/, '')
                    .trim();
            }
        }

        // Priority 3: NARRATIVE: label anywhere
        if (!narrative) {
            const legacyMatch = text.match(/NARRATIVE\s*:\s*([\s\S]*?)(?=\n---|\n##|<<<DATA_START|$)/i);
            if (legacyMatch) {
                narrative = legacyMatch[1].replace(/^\[/, '').replace(/\]$/, '').trim();
            }
        }

        // Remove NARRATIVE from dataBlock so it isn't processed as a regular field
        delete dataBlock['NARRATIVE'];

        return { dataBlock, confidences, narrative };
    }

    _extractInlineConf(line) {
        const m = line.match(/confidence=\[?(HIGH|LOW|UNCERTAIN|NOT_MENTIONED)\]?/i);
        return m ? m[1].toUpperCase() : null;   // null = AI did not include a rating
    }

    _task1KeyToDataKey(rawKey) {
        const map = {
            BIRTHDATE: 'BIRTHDATE', GENDER: 'GENDER', MARITAL_STATUS: 'MARITAL_STATUS',
            NUMBER_OF_DEPENDENTS: 'NUM_DEPENDENTS', MAILING_STREET: 'MAILING_STREET',
            MAILING_CITY: 'MAILING_CITY', MAILING_POSTCODE: 'MAILING_POSTCODE',
            MAILING_COUNTRY: 'MAILING_COUNTRY', PHONE: 'PHONE', MOBILE: 'MOBILE',
            EMAIL: 'EMAIL', COMMUNICATION_PREFERENCE: 'COMMS_PREF',
            EMPLOYMENT_STATUS: 'EMP_STATUS', EMPLOYER_NAME: 'EMPLOYER_NAME',
            OCCUPATION: 'OCCUPATION', DATE_EMPLOYMENT_COMMENCED: 'DATE_EMPLOYED',
            ANNUAL_INCOME: 'ANNUAL_INCOME', ANNUAL_BONUS: 'ANNUAL_BONUS',
            OTHER_INCOME: 'OTHER_INCOME', OTHER_INCOME_SOURCE: 'OTHER_INCOME_SRC',
            INTENDED_RETIREMENT_AGE: 'RETIREMENT_AGE',
            RISK_TOLERANCE: 'RISK_TOLERANCE', CAPACITY_FOR_LOSS: 'CAPACITY_FOR_LOSS',
            NI_NUMBER: 'NI_NUMBER', TAX_ID_NUMBER: 'TAX_ID',
            ENVIRONMENTAL: 'ENVIRONMENTAL', SOCIAL: 'SOCIAL',
            WILL_IN_PLACE: 'WILL_IN_PLACE', LPA_IN_PLACE: 'LPA_IN_PLACE',
            LPA_DETAILS: 'LPA_DETAILS',
            VULNERABILITY_DETECTED: 'VULN_DETECTED',
            VULNERABILITY_DESCRIPTION: 'VULN_DESC',
            VULNERABILITY_DURATION: 'VULN_DURATION'
        };
        return map[rawKey] || rawKey;
    }

    // ── Field map ───────────────────────────────────────────────────────────────

    _applyCurrentValues(currentData) {
        // Called on connectedCallback to seed current values before AI runs
        FIELD_DEFS.forEach(def => {
            if (!this.fieldMap[def.key]) {
                this.fieldMap[def.key] = {
                    key:          def.key,
                    label:        def.label,
                    sfField:      def.sfField,
                    tab:          def.tab,
                    inputType:    def.inputType,
                    groupLabel:   def.groupLabel || null,
                    currentValue: def.sfField ? (currentData[def.sfField] || '') : '',
                    aiValue:      '',
                    confidence:   'NOT_MENTIONED',
                    editValue:    '',
                    approved:     false,
                    checked:      false
                };
            } else if (def.sfField) {
                this.fieldMap[def.key] = {
                    ...this.fieldMap[def.key],
                    currentValue: currentData[def.sfField] || ''
                };
            }
        });
    }

    /**
     * Normalise AI-extracted raw value to match the field's expected format.
     * - YES_NO fields: true/yes → 'Yes', false/no → 'No'
     * - Any select with Yes/No options: also handle AI returning true/false
     * - Other select fields: case-insensitive match; returns '' if no match
     */
    _normalizeAIValue(aiRaw, def) {
        if (!aiRaw || aiRaw === 'NOT_MENTIONED') return '';
        if (def.inputType !== 'select') return aiRaw;

        const options = PICKLIST_OPTIONS[def.optionsKey] || [];
        const lower = aiRaw.toLowerCase().trim();

        // YES_NO fields: direct boolean mapping
        if (def.optionsKey === 'YES_NO') {
            return (lower === 'true' || lower === 'yes') ? 'Yes' : 'No';
        }

        // Any other select that has Yes/No options: handle AI boolean output
        // e.g. ENVIRONMENTAL/SOCIAL where AI may return "true" meaning "Yes"
        const hasYes = options.some(o => o.toLowerCase() === 'yes');
        const hasNo  = options.some(o => o.toLowerCase() === 'no');
        if (hasYes && hasNo) {
            if (lower === 'true')  return options.find(o => o.toLowerCase() === 'yes') || '';
            if (lower === 'false') return options.find(o => o.toLowerCase() === 'no')  || '';
        }

        // Normalise spaces around slashes (AI may output "Married / Civil Partner")
        const normalised = lower.replace(/\s*\/\s*/g, '/');

        // General case-insensitive exact match (with slash normalisation)
        const match = options.find(o => o.toLowerCase().replace(/\s*\/\s*/g, '/') === normalised);
        if (match) return match;

        // Fallback: AI may output only the first segment of a compound picklist value
        // e.g. "Married" → "Married/Civil Partner", "Widowed" → "Widowed/Surviving Civil Partner"
        const startsWithMatch = options.find(o => o.toLowerCase().replace(/\s*\/\s*/g, '/').startsWith(normalised));
        return startsWithMatch || '';
    }

    /**
     * Normalise any date string to YYYY-MM-DD for browser <input type="date">.
     * Handles common AI output formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY,
     * natural-language like "January 2030", "2030", "2030-01", etc.
     * Returns '' if the value cannot be reliably parsed.
     */
    _normalizeDateValue(raw) {
        if (!raw || raw === 'NOT_MENTIONED') return '';
        const s = raw.trim();

        // Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        // DD/MM/YYYY or D/M/YYYY
        const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmySlash) {
            return `${dmySlash[3]}-${dmySlash[2].padStart(2, '0')}-${dmySlash[1].padStart(2, '0')}`;
        }

        // YYYY-MM (year + month only) → first of that month
        if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;

        // MM/YYYY (prompt TASK 1 goal target_date format e.g. "06/2030") → YYYY-MM-01
        const mmYYYY = s.match(/^(\d{1,2})\/(\d{4})$/);
        if (mmYYYY) return `${mmYYYY[2]}-${mmYYYY[1].padStart(2, '0')}-01`;

        // YYYY only → first of the year
        if (/^\d{4}$/.test(s)) return `${s}-01-01`;

        // Try JS Date parse as last resort (handles "January 2030", "1 Jan 2030", ISO strings, etc.)
        const parsed = new Date(s);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        // Unrecognised — return the raw string; it may still be set as a placeholder
        return '';
    }

    _buildFieldMap(dataBlock, confidences, currentData) {
        const newMap = {};
        FIELD_DEFS.forEach(def => {
            const aiRaw       = dataBlock[def.key] || '';
            const confExplicit = def.key in confidences;  // AI actually rated this field
            const conf         = confidences[def.key] || (aiRaw && aiRaw !== 'NOT_MENTIONED' ? 'HIGH' : 'NOT_MENTIONED');

            // For date fields, normalise to YYYY-MM-DD before anything else
            let aiValue = this._normalizeAIValue(aiRaw, def);
            if (def.inputType === 'date') {
                aiValue = this._normalizeDateValue(aiValue || aiRaw);
            }

            // editValue pre-fill rules:
            //  - select:   pre-fill with normalised AI value (dropdown needs a value to show selection)
            //  - date:     pre-fill (browser ignores placeholder on date inputs)
            //  - textarea: pre-fill so content is visible (placeholder not reliable for content fields)
            //  - text/number: leave blank — aiValue shown as grey placeholder
            let editValue = '';
            if (def.inputType === 'select' || def.inputType === 'date' || def.inputType === 'textarea') {
                editValue = aiValue;
            }

            newMap[def.key] = {
                key:            def.key,
                label:          def.label,
                sfField:        def.sfField,
                tab:            def.tab,
                inputType:      def.inputType,
                optionsKey:     def.optionsKey || null,
                groupLabel:     def.groupLabel || null,
                currentValue:   def.sfField ? (currentData[def.sfField] || '') : '',
                aiValue:        aiValue,
                confidence:     conf,
                confExplicit:   confExplicit,  // true = AI rated this; false = fallback badge only
                editValue:      editValue,
                approved:       false,
                checked:        false
            };
        });
        this.fieldMap = newMap;
    }

    // ── Computed properties ─────────────────────────────────────────────────────

    get tabs() {
        return TAB_META.map(meta => {
            const fields = this._fieldsForTab(meta.id);
            const approvedCount   = fields.filter(f => f.approved).length;
            const withConf        = fields.filter(f => f.confidence !== 'NOT_MENTIONED');
            const avgConf         = withConf.length
                ? Math.round(withConf.reduce((s, f) => s + CONF_PCT[f.confidence], 0) / withConf.length)
                : 0;

            return {
                id:           meta.id,
                label:        meta.label,
                fields:       fields,
                fieldCount:   fields.length,
                approvedCount:approvedCount,
                avgConfidence:avgConf,
                tabBtnClass:  'ff-tab-btn' + (this.activeTab === meta.id ? ' active' : ''),
                panelClass:   'ff-tab-panel' + (this.activeTab === meta.id ? ' active' : '')
            };
        });
    }

    _fieldsForTab(tabId) {
        // ── Step 1: identify which groups have ≥1 AI value (hide fully-empty groups) ──
        const activeGroups = new Set();
        FIELD_DEFS.filter(d => d.tab === tabId).forEach(def => {
            if (def.groupLabel) {
                const f = this.fieldMap[def.key] || {};
                if (f.aiValue) activeGroups.add(def.groupLabel);
            }
        });

        // ── Step 2: filter visible fields ──
        // - Grouped tabs (goals/assets/liabilities): show ALL fields of active groups
        //   so advisors can manually fill in any field the AI missed within an active group
        // - Ungrouped tabs (personal/employment/risk/estate): only show if AI extracted
        //   a value OR there is an existing Salesforce value to display
        const visibleDefs = FIELD_DEFS
            .filter(d => d.tab === tabId)
            .filter(d => !d.groupLabel || activeGroups.has(d.groupLabel))
            .filter(d => {
                // Hide any field (grouped or not) where AI found nothing AND no existing SF value
                const f = this.fieldMap[d.key] || {};
                return !!(f.aiValue || f.currentValue);
            });

        // ── Step 3: map to row view objects ──
        return visibleDefs.map(def => {
            const f              = this.fieldMap[def.key] || {};
            // Only show a meaningful confidence badge if AI actually populated a value.
            // If the field is visible because of existing DB data but AI found nothing,
            // or if the normalised AI value is empty (e.g. unrecognised picklist value),
            // show NOT_MENTIONED so we don't display a misleading green badge.
            const conf           = f.aiValue ? (f.confidence || 'NOT_MENTIONED') : 'NOT_MENTIONED';
            const isNotMentioned = conf === 'NOT_MENTIONED';
            const isApproved     = !!f.approved;
            const isSelect       = def.inputType === 'select';
            const isTextarea     = def.inputType === 'textarea';
            const editVal        = f.editValue || '';

            let rowClass = 'ff-field-row';
            if (isApproved)  rowClass += ' is-approved';
            if (isNotMentioned) rowClass += ' is-not-mentioned';
            if (isTextarea)  rowClass += ' ff-field-row--tall';

            // Placeholder text for non-select inputs
            const aiVal = f.aiValue || '';
            const aiPlaceholder = aiVal
                ? aiVal
                : (isNotMentioned ? 'Not mentioned by client'
                    : (def.inputType === 'date' ? 'YYYY-MM-DD' : ''));

            // Build options array for select fields with isSelected flag
            const options = isSelect
                ? (PICKLIST_OPTIONS[def.optionsKey] || []).map(o => ({
                    value:      o,
                    label:      o,
                    isSelected: o === editVal
                  }))
                : [];

            return {
                key:             def.key,
                label:           def.label,
                inputType:       def.inputType,
                isSelect:        isSelect,
                isTextarea:      isTextarea,
                options:         options,
                showGroupHeader: !!def.groupLabel,
                groupLabel:      def.groupLabel || '',
                currentValue:    f.currentValue || '',
                currentValClass: 'ff-current-val' + (f.currentValue ? '' : ' empty'),
                aiPlaceholder:   aiPlaceholder,
                confidence:      conf,
                confLabel:       CONF_LABEL[conf],
                confBadgeClass:  'ff-conf-badge ' + (conf === 'NOT_MENTIONED' ? 'not-mentioned' : 'high'),
                editValue:       editVal,
                approved:        isApproved,
                checked:         !!f.checked,
                rowClass:        rowClass,
                approveBtnClass: 'ff-approve-btn' + (isApproved ? ' approved' : ''),
                approveBtnLabel: isApproved ? '✓ Approved' : 'Approve'
            };
        });
    }

    get overallConfidence() {
        // Only average fields the AI explicitly rated — fallback UNCERTAINs are for badge
        // display only and must not distort the headline score.
        const rated = Object.values(this.fieldMap).filter(f => f.confExplicit);
        if (!rated.length) return 0;
        return Math.round(
            rated.reduce((s, f) => s + (CONF_PCT[f.confidence] || 0), 0) / rated.length
        );
    }

    get overallConfidenceClass() {
        const pct = this.overallConfidence;
        let cls = 'ff-metric-value';
        if (pct >= 70) cls += ' conf-high';
        else if (pct >= 40) cls += ' conf-medium';
        else cls += ' conf-low';
        return cls;
    }

    get approvedCount() {
        return Object.values(this.fieldMap).filter(f => f.approved).length;
    }

    get totalFieldCount() {
        return FIELD_DEFS.length;
    }

    get narrativeTabClass() {
        return 'ff-tab-btn' + (this.activeTab === 'narrative' ? ' active' : '');
    }

    get narrativePanelClass() {
        return 'ff-tab-panel' + (this.activeTab === 'narrative' ? ' active' : '');
    }

    // ── Event handlers ──────────────────────────────────────────────────────────

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
        this.clearMessages();
    }

    handleCheckboxChange(event) {
        const key = event.target.dataset.key;
        this._mutateField(key, { checked: event.target.checked });
    }

    handleEditChange(event) {
        const key = event.target.dataset.key;
        this._mutateField(key, { editValue: event.target.value });
    }

    handleNarrativeChange(event) {
        this.narrativeEditValue = event.target.value;
    }

    handleApproveField(event) {
        const key = event.currentTarget.dataset.key;
        const field = this.fieldMap[key];
        if (!field) return;
        this._mutateField(key, { approved: !field.approved });
    }

    handleApproveAll(event) {
        const tabId = event.currentTarget.dataset.tab;
        this._setApprovedForTab(tabId, true);
    }

    handleRejectAll(event) {
        const tabId = event.currentTarget.dataset.tab;
        this._setApprovedForTab(tabId, false);
    }

    _setApprovedForTab(tabId, approved) {
        const newMap = { ...this.fieldMap };
        FIELD_DEFS
            .filter(def => def.tab === tabId)
            .forEach(def => {
                if (newMap[def.key]) {
                    newMap[def.key] = { ...newMap[def.key], approved };
                }
            });
        this.fieldMap = newMap;
    }

    _mutateField(key, patch) {
        const newMap = { ...this.fieldMap };
        if (newMap[key]) {
            newMap[key] = { ...newMap[key], ...patch };
        }
        this.fieldMap = newMap;
    }

    // ── Submit ──────────────────────────────────────────────────────────────────

    async handleSubmit() {
        this.clearMessages();

        if (this.approvedCount === 0) {
            this.errorMessage = 'Please approve at least one field before submitting.';
            return;
        }

        this.isSubmitting = true;
        try {
            // Build payload from approved fields.
            // If the advisor typed a value, use it; otherwise fall back to the
            // original AI value (which was shown as placeholder text).
            const payload = {};
            Object.values(this.fieldMap).forEach(f => {
                if (!f.approved) return;
                const valueToSubmit = (f.editValue !== '' && f.editValue != null)
                    ? f.editValue
                    : f.aiValue;
                if (valueToSubmit) payload[f.key] = valueToSubmit;
            });

            // Always include narrative if it has content
            if (this.narrativeEditValue) {
                payload['NARRATIVE'] = this.narrativeEditValue;
            }

            await saveFactFind({
                accountId:   this.recordId,
                isRecordId:  this.interactionSummaryId,
                dataJson:    JSON.stringify(payload)
            });

            // ── Build submitted summary for success screen ──
            const goals       = [1,2,3].filter(n => payload[`G${n}_NAME`]).length;
            const assets      = [1,2,3,4,5].filter(n => payload[`A${n}_NAME`]).length;
            const liabilities = [1,2,3,4,5].filter(n => payload[`L${n}_NAME`]).length;

            // Account fields = everything that isn't a goal/asset/liability sub-field or NARRATIVE
            const groupKeys = new Set();
            for (let n = 1; n <= 3; n++) ['NAME','TYPE','AMOUNT','DATE','PRIORITY','DESC'].forEach(f => groupKeys.add(`G${n}_${f}`));
            for (let n = 1; n <= 5; n++) ['NAME','TYPE','VALUE','DESC'].forEach(f => groupKeys.add(`A${n}_${f}`));
            for (let n = 1; n <= 5; n++) ['NAME','TYPE','BALANCE','LENDER','RATE','PAYMENT'].forEach(f => groupKeys.add(`L${n}_${f}`));
            const accountFields = Object.keys(payload).filter(k => !groupKeys.has(k) && k !== 'NARRATIVE').length;

            const now = new Date();
            const submittedAt = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                + ' at ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            this.submittedSummary = {
                clientName:   this.accountName,
                meetingDate:  this.interactionDate,
                submittedAt,
                accountFields,
                goals,
                assets,
                liabilities,
                narrative: this.narrativeEditValue
            };
            this._persistSubmittedState(this.submittedSummary);

        } catch (e) {
            this.errorMessage = 'Save failed: ' + (e.body?.message || e.message || String(e));
        } finally {
            this.isSubmitting = false;
        }
    }

    handleRunAgain() {
        this._clearSubmittedState();
        this.submittedSummary     = null;
        this.hasAiData            = false;
        this.showEmptyState       = true;
        this.fieldMap             = {};
        this.narrativeEditValue   = '';
        this.interactionDate      = '';
        this.interactionSummaryId = null;
        this.errorMessage         = '';
        this.successMessage       = '';
        this._loadAccountName();
    }

    // ── Utilities ───────────────────────────────────────────────────────────────

    clearMessages() {
        this.errorMessage   = '';
        this.successMessage = '';
    }
}