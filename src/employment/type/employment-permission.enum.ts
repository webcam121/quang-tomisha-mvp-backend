import { EmploymentRole } from "./employment-role.enum";

export enum EmploymentPermission {
  VIEW_APPLICATION = EmploymentRole.HR,
  MUTATE_JOB = EmploymentRole.HR,
  DELETE_JOB = EmploymentRole.HR,
  BUY_JOBS = EmploymentRole.HR,
  CREATE_INTERVIEW = EmploymentRole.HR,
  HIRE_EMPLOYEE = EmploymentRole.HR,
  CREATE_EMPLOYEE = EmploymentRole.HR,
  DELETE_EMPLOYEE = EmploymentRole.HR,
  CREATE_HR = EmploymentRole.MAINTAINER,
  DELETE_HR = EmploymentRole.MAINTAINER,
  CREATE_BRANCH = EmploymentRole.MAINTAINER,
  DELETE_BRANCH = EmploymentRole.MAINTAINER,
  ASSIGN_BRANCH_OWNER = EmploymentRole.MAINTAINER,
  CREATE_MAINTAINER = EmploymentRole.ADMIN,
  DELETE_MAINTAINER = EmploymentRole.ADMIN,
  CREATE_OWNER = EmploymentRole.ADMIN,
  DEACTIVATE_COMPANY = EmploymentRole.ADMIN,
}