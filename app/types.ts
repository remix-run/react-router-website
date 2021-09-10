/**
 * React's built-in function component type always includes children, which we
 * might not want
 */
export interface FunctionComponent<P = {}> {
  (props: P, context?: any): React.ReactElement<any, any> | null;
  propTypes?: React.WeakValidationMap<P> | undefined;
  contextTypes?: React.ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}
