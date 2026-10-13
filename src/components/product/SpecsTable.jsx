/**
 * Specification tables.
 *
 * Each group is a <table> with a real <caption> and scoped headers, so screen
 * readers announce the group name plus each label/value pair correctly.
 * The first column is marked <th scope="row">.
 */
export default function SpecsTable({ groups }) {
  return (
    <div className="specs">
      {groups.map((group) => (
        <table className="specs__table" key={group.group}>
          <caption className="specs__caption">{group.group}</caption>
          <tbody>
            {group.rows.map(([label, value]) => (
              <tr key={label} className="specs__row">
                <th scope="row" className="specs__label">
                  {label}
                </th>
                <td className="specs__value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}