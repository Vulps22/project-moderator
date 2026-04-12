import { ApiRoute } from "../bot/api/types/ApiRoute";

const ping: ApiRoute = {
  async get(req, res): Promise<void> {
    res.status(200).json({ message: "OK" });
  }
};

export default ping;