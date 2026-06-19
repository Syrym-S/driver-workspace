import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { Box } from "@mui/material";

import { TenderDetailsSection } from "./TenderDetailsSection";
import { TenderInfoBadge } from "../tender-details/TenderInfoBadge";

export function TenderForwarderSection({ tender }) {
    const forwarder = tender.forwarder || tender.lead?.forwarder || {};

    return (
        <TenderDetailsSection
            icon={<BusinessOutlinedIcon />}
            title='Экспедитор'
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                    },
                    gap: 1,
                }}
            >
                <TenderInfoBadge
                    label='ФИО'
                    value={
                        forwarder.fullName ||
                        forwarder.name ||
                        tender.forwarder_name ||
                        "Не указано"
                    }
                />

                <TenderInfoBadge
                    label='Компания'
                    value={
                        forwarder.companyName ||
                        forwarder.company_name ||
                        tender.forwarder_company ||
                        "Не указано"
                    }
                />

                <TenderInfoBadge
                    label='Телефон'
                    value={
                        forwarder.phone ||
                        tender.forwarder_phone ||
                        "Не указано"
                    }
                />

                <TenderInfoBadge
                    label='БИН / ИИН'
                    value={
                        forwarder.companyBin ||
                        forwarder.bin ||
                        forwarder.iin ||
                        "Не указано"
                    }
                />
            </Box>
        </TenderDetailsSection>
    );
}
