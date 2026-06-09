import type { IAppListProps } from "../../components";
import type { IBasePageProps } from "./base-page";


export interface IListPageProps extends IBasePageProps {
  isTabList?: boolean | false;
  items?: Array<IAppListProps>;
}
