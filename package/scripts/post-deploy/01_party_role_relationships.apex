// Post-deployment: load the 32 Party Role Relationships (role definitions such as Husband-Wife-CCR).
// They are data, not metadata, so a deploy does not bring them. Copied from wmcoredev26 and checked identical
// (names, roles, object types, auto-inverse flag, inverse links).
// Run:  sf apex run --file scripts/post-deploy/01_party_role_relationships.apex --target-org <alias>
// Safe to re-run: records that already exist (by Name) are skipped.
Set<String> have = new Set<String>();
for (PartyRoleRelation p : [SELECT Name FROM PartyRoleRelation]) have.add(p.Name);
List<PartyRoleRelation> primaries = new List<PartyRoleRelation>();
// 1. Primary records: Salesforce creates the inverse record automatically.
if (!have.contains('Accountant-Business-AAR')) primaries.add(new PartyRoleRelation(Name='Accountant-Business-AAR', RoleName='Accountant', RelatedRoleName='Business', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Accountant-Client-CCR')) primaries.add(new PartyRoleRelation(Name='Accountant-Client-CCR', RoleName='Accountant', RelatedRoleName='Client', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Advisor-Client-AAR')) primaries.add(new PartyRoleRelation(Name='Advisor-Client-AAR', RoleName='Advisor', RelatedRoleName='Client', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Advisor-Client-CCR')) primaries.add(new PartyRoleRelation(Name='Advisor-Client-CCR', RoleName='Advisor', RelatedRoleName='Client', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Business-Household-AAR')) primaries.add(new PartyRoleRelation(Name='Business-Household-AAR', RoleName='Business', RelatedRoleName='Household', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Business-Lawyer-AAR')) primaries.add(new PartyRoleRelation(Name='Business-Lawyer-AAR', RoleName='Business', RelatedRoleName='Lawyer', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Child-Parent-CCR')) primaries.add(new PartyRoleRelation(Name='Child-Parent-CCR', RoleName='Child', RelatedRoleName='Parent', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Client-Consultant-CCR')) primaries.add(new PartyRoleRelation(Name='Client-Consultant-CCR', RoleName='Client', RelatedRoleName='Consultant', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Client-Lawyer-CCR')) primaries.add(new PartyRoleRelation(Name='Client-Lawyer-CCR', RoleName='Client', RelatedRoleName='Lawyer', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Dependent-Domestic Partner-CCR')) primaries.add(new PartyRoleRelation(Name='Dependent-Domestic Partner-CCR', RoleName='Dependent', RelatedRoleName='Domestic Partner', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Grandchild-Grandparent-CCR')) primaries.add(new PartyRoleRelation(Name='Grandchild-Grandparent-CCR', RoleName='Grandchild', RelatedRoleName='Grandparent', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Household-Trust-AAR')) primaries.add(new PartyRoleRelation(Name='Household-Trust-AAR', RoleName='Household', RelatedRoleName='Trust', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Husband-Wife-CCR')) primaries.add(new PartyRoleRelation(Name='Husband-Wife-CCR', RoleName='Husband', RelatedRoleName='Wife', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=true));
if (!have.contains('Uses Provider-Provides Services To-AAR')) primaries.add(new PartyRoleRelation(Name='Uses Provider-Provides Services To-AAR', RoleName='Uses Provider', RelatedRoleName='Provides Services To', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=true));
insert primaries;
// 2. Records with no auto-inverse in dev26: create and link by hand.
if (!have.contains('Spouse-Spouse-CCR')) insert new PartyRoleRelation(Name='Spouse-Spouse-CCR', RoleName='Spouse', RelatedRoleName='Spouse', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=false);
if (!have.contains('Ex-Spouse-Ex-Spouse-CCR')) { PartyRoleRelation ex = new PartyRoleRelation(Name='Ex-Spouse-Ex-Spouse-CCR', RoleName='Ex-Spouse', RelatedRoleName='Ex-Spouse', RelationshipObjectName='Contact_Contact_Relationship', ShouldCreaInversRoleAuto=false); insert ex; ex.RelatedInverseRecordId = ex.Id; update ex; }
if (!have.contains('Holds Shares In-Owned By-AAR')) { PartyRoleRelation a = new PartyRoleRelation(Name='Holds Shares In-Owned By-AAR', RoleName='Holds Shares In', RelatedRoleName='Owned By', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=false); PartyRoleRelation b = new PartyRoleRelation(Name='Owned By-Holds Shares In-AAR', RoleName='Owned By', RelatedRoleName='Holds Shares In', RelationshipObjectName='Account_Account_Relationship', ShouldCreaInversRoleAuto=false); insert new List<PartyRoleRelation>{a,b}; a.RelatedInverseRecordId = b.Id; b.RelatedInverseRecordId = a.Id; update new List<PartyRoleRelation>{a,b}; }
System.debug('Party Role Relationships now: ' + [SELECT COUNT() FROM PartyRoleRelation]);
