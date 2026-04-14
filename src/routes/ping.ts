import { ApiRoute } from "../bot/api/types/ApiRoute";

const ping: ApiRoute = {
  get(req, res): void {
    res.status(200).json({ message: "OK" });
  }
};

export default ping;