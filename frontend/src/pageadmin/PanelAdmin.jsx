import Siderbar from "./Sidebar";
import SowStatus from "../components/graficos/SowStatus";
import TotalSow from "../components/graficos/TotalSow";

const PanelAdmin = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div className="row">
        <div className="col-sm-1 g-0">
          <div className="bg-body-primary">
            <Siderbar />
          </div>
        </div>
        <div className="col-sm-11 mb-5 g-0">
          <div className="container d-flex justify-content-center">
            <div className="col-sm-8 ">
              <div className="mb-4 mt-5 d-flex justify-content-center">
                <h2>S.O.W Status</h2>
              </div>
              <div className="ms-5" style={{marginBottom: "20px"}}>
              <TotalSow />
              </div>
              <div
                className="d-flex justify-content-center"
                style={{ height: "400px" }}
              >
                <SowStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;
